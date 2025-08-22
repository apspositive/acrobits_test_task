// External libraries
import { UserAgent, Registerer, Inviter, SessionState, Invitation, UserAgentState } from 'sip.js';

// Store and state management
import store from '../store';
import { updateSipState } from '../store/sipSlice';
import { addCall } from '../store/callHistorySlice';

// Configuration
import sipConfig from '../sipConfig';

// Audio service
import { audioService } from './audioService';

// Types
import type { CallDirection, CallStatus } from '../helpers/types';

export interface CallHistoryItem {
  id: string;
  number: string;
  direction: CallDirection;
  status: CallStatus;
  timestamp: Date | string;
  duration?: number;
}

export interface SipServiceState {
  isConnected: boolean;
  isRegistered: boolean;
  isCalling: boolean;
  isInCall: boolean;
  callStatus: string;
  isMuted: boolean;
  isOnHold: boolean;
}

/**
 * SIP Service Class
 * 
 * This class handles all SIP communication including:
 * - User agent initialization and registration
 * - Incoming and outgoing call handling
 * - Call state management
 * - Integration with Redux store for UI updates
 */
export class SipService {
  // SIP.js objects
  private userAgent: UserAgent | null = null;
  private registerer: Registerer | null = null;
  private session: Inviter | Invitation | null = null;
  private incomingInvitation: Invitation | null = null;
  
  // Call tracking
  private callStartTime: number = 0;
  
  // User credentials
  private username: string;
  private domain: string;
  
  // Registration management
  private registrationRefreshInterval: ReturnType<typeof setInterval> | null = null;
  
  // Current state
  private state: SipServiceState = {
    isConnected: false,     // Whether we have a connection to the SIP server
    isRegistered: false,    // Whether we are registered with the SIP server
    isCalling: false,       // Whether we are currently placing or receiving a call
    isInCall: false,        // Whether we are currently in an active call
    callStatus: 'Ready',    // Current call status message for UI
    isMuted: false,         // Whether the current call is muted
    isOnHold: false         // Whether the current call is on hold
  };
  
  /**
   * Constructor
   * @param username SIP username
   * @param domain SIP domain
   */
  constructor(
    username: string,
    domain: string
  ) {
    this.username = username;
    this.domain = domain;
  }
  
  // ======================================================================
  // BACKWARD COMPATIBILITY METHODS
  // ======================================================================
  
  /**
   * These methods are kept for backward compatibility but won't be used
   * State changes are now handled through Redux
   */
  public setOnStateChange() {
    // No-op - using Redux instead
  }
  
  public setOnCallHistoryUpdate() {
    // No-op - using Redux instead
  }
  
  // ======================================================================
  // INITIALIZATION METHODS
  // ======================================================================
  
  /**
   * Initialize SIP user agent
   * 
   * This method:
   * 1. Creates and configures the SIP user agent
   * 2. Sets up event listeners for connection state changes
   * 3. Configures incoming call handling
   * 4. Starts the user agent
   * 5. Registers with the SIP server
   * 6. Sets up periodic registration refresh
   */
  public async initialize() {
    try {
      // Create user agent
      this.userAgent = new UserAgent({
        uri: UserAgent.makeURI(sipConfig.user1.uri)!,
        transportOptions: {
          wsServers: [sipConfig.transportOptions.server],
          connectionTimeout: sipConfig.transportOptions.connectionTimeout,
          keepAliveInterval: sipConfig.transportOptions.keepAliveInterval,
          traceSip: sipConfig.transportOptions.traceSip
        },
        authorizationUsername: this.username,
        authorizationPassword: sipConfig.user1.password
      });
      
      // Handle connection state changes
      this.userAgent.stateChange.addListener((state: UserAgentState) => {
        console.log('User agent state changed:', state);
        this.updateState({
          isConnected: state === UserAgentState.Started
        });
      });
      
      // Monitor transport connection state directly
      this.userAgent.transport.onConnect = () => {
        console.log('Transport connected');
        this.updateState({ isConnected: true });
      };
      
      this.userAgent.transport.onDisconnect = () => {
        console.log('Transport disconnected');
        this.updateState({ isConnected: false });
      };
      
      // Handle incoming invitations
      this.userAgent.delegate = {
        onInvite: (invitation: Invitation) => {
          console.log('Incoming call from:', invitation.remoteIdentity.uri);
          
          // Store the invitation for later handling
          this.incomingInvitation = invitation;
          
          // Play ringtone for incoming call
          audioService.playRingtone();
          
          // Update state to indicate incoming call
          this.updateState({
            isCalling: true,
            callStatus: `Incoming call from ${invitation.remoteIdentity.uri.user || 'Unknown'}`
          });
          
          // Handle the invitation state changes
          invitation.stateChange.addListener((state: SessionState) => {
            console.log('Incoming call state changed:', state);
            
            // If this invitation has been accepted and became our session, 
            // we don't need to handle state changes here anymore
            if (this.session === invitation && state === SessionState.Established) {
              // The acceptIncomingCall method already handled the state update
              return;
            }
            
            switch (state) {
              case SessionState.Established:
                // This should only happen if the call was auto-accepted (which we don't do)
                this.callStartTime = Date.now();
                this.updateState({
                  isCalling: false,
                  isInCall: true,
                  callStatus: 'In call',
                  isMuted: false,
                  isOnHold: false
                });
                break;
              case SessionState.Terminated:
                {
                  const duration = this.callStartTime ? Math.floor((Date.now() - this.callStartTime) / 1000) : 0;
                  this.updateState({
                    isCalling: false,
                    isInCall: false,
                    callStatus: 'Ready',
                    isMuted: false,
                    isOnHold: false
                  });
                  
                  // Determine call status based on whether it was established
                  let callStatus: 'completed' | 'missed' | 'rejected' | 'in-progress' = 'completed';
                  if (!this.callStartTime) {
                    // If never established, determine if it was rejected or missed
                    // For incoming calls, if terminated before established, it's usually rejected
                    callStatus = 'rejected';
                  }
                  
                  // Add to call history
                  store.dispatch(addCall({
                    id: Date.now().toString(),
                    number: invitation.remoteIdentity.uri.user || 'Unknown',
                    direction: 'incoming',
                    status: callStatus,
                    timestamp: new Date(),
                    duration: callStatus === 'completed' ? duration : undefined
                  }));
                  
                  // Stop ringtone and clear the incoming invitation
                  audioService.stopRingtone();
                  if (this.incomingInvitation === invitation) {
                    this.incomingInvitation = null;
                  }
                  
                  // Reset call start time after processing
                  this.callStartTime = 0;
                }
                break;
            }
          });
        }
      };
      
      // Start the user agent
      await this.userAgent.start();
      
      // Create registerer
      this.registerer = new Registerer(this.userAgent);
      
      // Handle registration state changes
      this.registerer.stateChange.addListener((state: string) => {
        console.log('Registration state changed:', state);
        this.updateState({
          isRegistered: state === 'Registered',
          callStatus: state === 'Registered' ? 'Ready' : 'Registration failed'
        });
      });
      
      // Register
      await this.registerer.register();
      
      // Set up periodic registration refresh
      this.registrationRefreshInterval = setInterval(() => {
        if (this.registerer && this.state.isRegistered) {
          this.registerer.register().catch(error => {
            console.error('Registration refresh failed:', error);
            this.updateState({ isRegistered: false, callStatus: 'Registration failed' });
          });
        }
      }, 300000); // Refresh every 5 minutes
      
      this.updateState({ callStatus: 'Ready' });
    } catch (error) {
      console.error('SIP initialization error:', error);
      this.updateState({ callStatus: 'Connection failed' });
    }
  }
  
  // ======================================================================
  // CALL MANAGEMENT METHODS
  // ======================================================================
  
  /**
   * Place outgoing call
   * 
   * This method:
   * 1. Creates an invitation to the specified phone number
   * 2. Sets up event listeners for call state changes
   * 3. Sends the invitation
   * 
   * @param phoneNumber The phone number to call
   */
  public async placeCall(phoneNumber: string) {
    if (!this.userAgent || !phoneNumber) return;
    
    try {
      this.updateState({
        isCalling: true,
        callStatus: 'Calling...'
      });
      
      // Create target URI
      const targetURI = `sip:${phoneNumber}@${this.domain}`;
      
      // Create invitation
      this.session = new Inviter(this.userAgent, UserAgent.makeURI(targetURI)!);
      
      // Handle session state changes
      this.session.stateChange.addListener((state: SessionState) => {
        console.log('Session state changed:', state);
        
        switch (state) {
          case SessionState.Established:
            this.callStartTime = Date.now();
            this.updateState({
              isCalling: false,
              isInCall: true,
              callStatus: 'In call'
            });
            break;
          case SessionState.Terminated:
            {
              console.log('Call terminated, current call start time:', this.callStartTime);
              const duration = this.callStartTime ? Math.floor((Date.now() - this.callStartTime) / 1000) : 0;
              this.updateState({
                isCalling: false,
                isInCall: false,
                callStatus: 'Ready',
                isMuted: false,
                isOnHold: false
              });
              console.log('Updated Redux state after call termination');
              
              // Add to call history
              // Determine call status based on whether the call was established
              let callStatus: 'completed' | 'missed' | 'rejected' | 'in-progress' = 'completed';
              
              // If the session was never established (callStartTime is 0), it's a rejected call
              // Also mark as rejected if terminated by remote party after establishment
              if (!this.callStartTime) {
                callStatus = 'rejected';
              }
              
              const callHistoryItem: CallHistoryItem = {
                id: Date.now().toString(),
                number: phoneNumber,
                direction: 'outgoing',
                status: callStatus,
                timestamp: new Date().toISOString(),
                duration: callStatus === 'completed' ? duration : undefined
              };
              
              // Dispatch to Redux store
              store.dispatch(addCall(callHistoryItem));
              console.log('Added call to history:', callHistoryItem);
              
              // Clear session reference
              this.session = null;
              
              // Reset call start time after processing
              this.callStartTime = 0;
            }
            break;
        }
      });
      
      // Send invitation
      await this.session.invite();
    } catch (error) {
      console.error('Call placement error:', error);
      this.updateState({
        isCalling: false,
        callStatus: 'Call failed'
      });
      // Reset call start time
      this.callStartTime = 0;
    }
  }
  
  /**
   * End current call
   * 
   * This method handles ending calls in various states:
   * - Rejecting incoming calls that haven't been answered
   * - Ending established calls with a BYE message
   * - Canceling outgoing calls that haven't been answered
   * - Updating UI state and call history
   */
  public async endCall() {
    console.log('Ending call, session:', this.session, 'incomingInvitation:', this.incomingInvitation);
    // Check if this is an incoming call that needs to be rejected
    if (this.incomingInvitation && this.incomingInvitation.state === SessionState.Initial) {
      try {
        await this.incomingInvitation.reject();
        // Update state after rejecting incoming call
        this.updateState({
          isCalling: false,
          callStatus: 'Ready'
        });
        
        // Add rejected call to history
        const callerNumber = this.incomingInvitation.remoteIdentity.uri.user || 'Unknown';
        const rejectedCall: CallHistoryItem = {
          id: Date.now().toString(),
          number: callerNumber,
          direction: 'incoming',
          status: 'rejected',
          timestamp: new Date()
        };
        
        // Dispatch to Redux store
        store.dispatch(addCall(rejectedCall));
        
        // Stop ringtone and clear the incoming invitation
        audioService.stopRingtone();
        this.incomingInvitation = null;
      } catch (error) {
        console.error('Error rejecting call:', error);
      }
      return;
    }
    
    if (this.session) {
      try {
        // Check if this is an incoming call (Invitation) or outgoing call (Inviter)
        if (this.session instanceof Invitation) {
          // This is an incoming call (Invitation)
          console.log('Rejecting incoming call, state:', this.session.state);
          if (this.session.state === SessionState.Established) {
            await this.session.bye();
          } else if (this.session.state === SessionState.Initial) {
            await this.session.reject();
          }
        } else {
          // This is an outgoing call (Inviter)
          console.log('Ending outgoing call, state:', this.session.state);
          if (this.session.state === SessionState.Established) {
            await this.session.bye();
          } else if (this.session.state === SessionState.Initial) {
            // For initial state, we should cancel the call
            this.session.cancel();
          }
          // For other states, we just need to update the UI state
        }
      } catch (error) {
        console.error('Error ending call:', error);
      } finally {
        // Determine if this is a rejected call (never established)
        const wasCallRejected = !this.callStartTime && this.session instanceof Inviter;
        
        // Force state update
        this.updateState({
          isCalling: false,
          isInCall: false,
          callStatus: 'Ready',
          isMuted: false,
          isOnHold: false
        });
        
        // Add to call history if this was an outgoing call
        if (this.session instanceof Inviter) {
          const duration = this.callStartTime ? Math.floor((Date.now() - this.callStartTime) / 1000) : 0;
          const callStatus: 'completed' | 'missed' | 'rejected' | 'in-progress' = wasCallRejected ? 'rejected' : 'completed';
          
          const callHistoryItem: CallHistoryItem = {
            id: Date.now().toString(),
            number: this.session.remoteIdentity.uri.user || 'Unknown',
            direction: 'outgoing',
            status: callStatus,
            timestamp: new Date().toISOString(),
            duration: callStatus === 'completed' ? duration : undefined
          };
          
          // Dispatch to Redux store
          store.dispatch(addCall(callHistoryItem));
          console.log('Added call to history:', callHistoryItem);
        }
        
        // Reset session and call start time
        this.session = null;
        this.callStartTime = 0;
      }
    } else {
      // If there's no session, still update the state to ensure UI is consistent
      console.log('No session found, updating state anyway');
      this.updateState({
        isCalling: false,
        isInCall: false,
        callStatus: 'Ready',
        isMuted: false,
        isOnHold: false
      });
    }
  }
  
  // ======================================================================
  // CALL CONTROL METHODS
  // ======================================================================
  
  /**
   * Toggle mute state for the current call
   */
  public toggleMute() {
    if (this.session) {
      // In a real implementation, this would actually mute the call
      // For now, we're just updating the UI state
      this.updateState({ isMuted: !this.state.isMuted });
      console.log(`Call ${!this.state.isMuted ? 'muted' : 'unmuted'}`);
    }
  }
  
  /**
   * Toggle hold state for the current call
   */
  public async toggleHold() {
    if (this.session) {
      // In a real implementation, this would actually put the call on hold
      // For now, we're just updating the UI state
      this.updateState({ isOnHold: !this.state.isOnHold });
      console.log(`Call ${!this.state.isOnHold ? 'put on hold' : 'resumed'}`);
    }
  }
  
  // ======================================================================
  // GETTER METHODS
  // ======================================================================
  
  /**
   * Get current state
   * @returns A copy of the current SIP service state
   */
  public getState(): SipServiceState {
    return { ...this.state };
  }
  
  /**
   * Get call start time
   * @returns Timestamp when the current call started
   */
  public getCallStartTime(): number {
    return this.callStartTime;
  }
  
  /**
   * Get call duration
   * @returns Duration of the current call in seconds
   */
  public getCallDuration(): number {
    return this.callStartTime ? Math.floor((Date.now() - this.callStartTime) / 1000) : 0;
  }
  
  // ======================================================================
  // INCOMING CALL METHODS
  // ======================================================================
  
  /**
   * Accept incoming call
   * 
   * This method accepts an incoming call invitation and updates the session state
   */
  public async acceptIncomingCall() {
    if (this.incomingInvitation && this.incomingInvitation.state === SessionState.Initial) {
      try {
        // Accept the incoming call
        await this.incomingInvitation.accept();
        // Set the session to the invitation for proper call handling
        this.session = this.incomingInvitation;
        // Stop ringtone and clear the incoming invitation as it's now the active session
        audioService.stopRingtone();
        this.incomingInvitation = null;
        // Update state to reflect we're now in a call
        this.callStartTime = Date.now();
        this.updateState({
          isCalling: false,
          isInCall: true,
          callStatus: 'In call'
        });
      } catch (error) {
        console.error('Error accepting call:', error);
        this.updateState({
          isCalling: false,
          callStatus: 'Ready'
        });
      }
    }
  }
  
  /**
   * Reject incoming call
   * 
   * This method rejects an incoming call invitation and updates the UI state
   */
  public async rejectIncomingCall() {
    if (this.incomingInvitation && this.incomingInvitation.state === SessionState.Initial) {
      try {
        await this.incomingInvitation.reject();
        // Update state after rejecting incoming call
        this.updateState({
          isCalling: false,
          callStatus: 'Ready'
        });
        
        // Add rejected call to history
        const callerNumber = this.incomingInvitation.remoteIdentity.uri.user || 'Unknown';
        const rejectedCall: CallHistoryItem = {
          id: Date.now().toString(),
          number: callerNumber,
          direction: 'incoming',
          status: 'rejected',
          timestamp: new Date()
        };
        
        // Dispatch to Redux store
        store.dispatch(addCall(rejectedCall));
        
        // Stop ringtone and clear the incoming invitation
        audioService.stopRingtone();
        this.incomingInvitation = null;
      } catch (error) {
        console.error('Error rejecting call:', error);
      }
    }
  }
  
  /**
   * Get caller number for incoming call
   * @returns The caller's phone number or 'Unknown' if not available
   */
  public getIncomingCallerNumber(): string {
    if (this.incomingInvitation) {
      return this.incomingInvitation.remoteIdentity.uri.user || 'Unknown';
    }
    return '';
  }
  
  // ======================================================================
  // CLEANUP METHODS
  // ======================================================================
  
  /**
   * Cleanup SIP resources
   * 
   * This method:
   * 1. Clears the registration refresh interval
   * 2. Ends any active calls
   * 3. Unregisters from the SIP server
   * 4. Stops the user agent
   * 5. Resets session state
   */
  public async cleanup() {
    // Clear registration refresh interval
    if (this.registrationRefreshInterval) {
      clearInterval(this.registrationRefreshInterval);
      this.registrationRefreshInterval = null;
    }
    
    if (this.session) {
      try {
        await this.session.bye();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
    
    if (this.registerer) {
      try {
        await this.registerer.unregister();
      } catch (error) {
        console.error('Error unregistering:', error);
      }
    }
    
    if (this.userAgent) {
      try {
        await this.userAgent.stop();
      } catch (error) {
        console.error('Error stopping user agent:', error);
      }
    }
    
    // Stop any playing ringtone
    audioService.stopRingtone();
    
    // Reset session and call start time
    this.session = null;
    this.incomingInvitation = null;
    this.callStartTime = 0;
  }
  
  // Update state and notify listeners
  private updateState(updates: Partial<SipServiceState>) {
    console.log('Updating SIP state:', updates);
    this.state = { ...this.state, ...updates };
    console.log('New SIP state:', this.state);
    // Dispatch to Redux store
    store.dispatch(updateSipState(updates));
    console.log('Dispatched to Redux store');
  }
}

