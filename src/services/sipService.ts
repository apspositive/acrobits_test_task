import { UserAgent, Registerer, Inviter, SessionState, Invitation, UserAgentState } from 'sip.js';
import store from '../store';
import { updateSipState } from '../store/sipSlice';
import { addCall } from '../store/callHistorySlice';
import sipConfig from '../sipConfig';

// Types
export interface CallHistoryItem {
  id: string;
  number: string;
  direction: 'incoming' | 'outgoing';
  status: 'completed' | 'missed' | 'rejected' | 'in-progress';
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

// SIP Service Class
export class SipService {
  private userAgent: UserAgent | null = null;
  private registerer: Registerer | null = null;
  private session: Inviter | Invitation | null = null;
  private incomingInvitation: Invitation | null = null;
  private callStartTime: number = 0;
  private username: string;
  private domain: string;
  private registrationRefreshInterval: ReturnType<typeof setInterval> | null = null;
  
  // State
  private state: SipServiceState = {
    isConnected: false,
    isRegistered: false,
    isCalling: false,
    isInCall: false,
    callStatus: 'Ready',
    isMuted: false,
    isOnHold: false
  };
  
  constructor(
    username: string,
    domain: string
  ) {
    this.username = username;
    this.domain = domain;
  }
  
  // These methods are kept for backward compatibility but won't be used
  public setOnStateChange() {
    // No-op - using Redux instead
  }
  
  public setOnCallHistoryUpdate() {
    // No-op - using Redux instead
  }
  
  // Initialize SIP user agent
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
                  
                  // Clear invitation reference if it's still pointing to this invitation
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
  
  // Place outgoing call
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
  
  // End current call
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
        
        // Clear the incoming invitation
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
  public toggleMute() {
    if (this.session) {
      // In a real implementation, this would actually mute the call
      // For now, we're just updating the UI state
      this.updateState({ isMuted: !this.state.isMuted });
      console.log(`Call ${!this.state.isMuted ? 'muted' : 'unmuted'}`);
    }
  }
  
  // Toggle hold
  public async toggleHold() {
    if (this.session) {
      // In a real implementation, this would actually put the call on hold
      // For now, we're just updating the UI state
      this.updateState({ isOnHold: !this.state.isOnHold });
      console.log(`Call ${!this.state.isOnHold ? 'put on hold' : 'resumed'}`);
    }
  }
  
  // Get current state
  public getState(): SipServiceState {
    return { ...this.state };
  }
  
  // Get call start time
  public getCallStartTime(): number {
    return this.callStartTime;
  }
  
  // Get call duration
  public getCallDuration(): number {
    return this.callStartTime ? Math.floor((Date.now() - this.callStartTime) / 1000) : 0;
  }
  
  // Accept incoming call
  public async acceptIncomingCall() {
    if (this.incomingInvitation && this.incomingInvitation.state === SessionState.Initial) {
      try {
        // Accept the incoming call
        await this.incomingInvitation.accept();
        // Set the session to the invitation for proper call handling
        this.session = this.incomingInvitation;
        // Clear the incoming invitation as it's now the active session
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
  
  // Reject incoming call
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
        
        // Clear the incoming invitation
        this.incomingInvitation = null;
      } catch (error) {
        console.error('Error rejecting call:', error);
      }
    }
  }
  
  // Get caller number for incoming call
  public getIncomingCallerNumber(): string {
    if (this.incomingInvitation) {
      return this.incomingInvitation.remoteIdentity.uri.user || 'Unknown';
    }
    return '';
  }
  
  // Cleanup
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

export default SipService;
