import { UserAgent, Registerer, Inviter, SessionState, Invitation, UserAgentState } from 'sip.js';
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
  private session: Inviter | null = null;
  private callStartTime: number = 0;
  private username: string;
  private domain: string;
  
  // Callbacks
  private onStateChange: ((state: SipServiceState) => void) | null = null;
  private onCallHistoryUpdate: ((call: CallHistoryItem) => void) | null = null;
  
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
  
  // Set callbacks
  public setOnStateChange(callback: (state: SipServiceState) => void) {
    this.onStateChange = callback;
  }
  
  public setOnCallHistoryUpdate(callback: (call: CallHistoryItem) => void) {
    this.onCallHistoryUpdate = callback;
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
          
          // For demo purposes, we'll automatically reject incoming calls
          invitation.reject();
          
          // Add to call history
          const newCall: CallHistoryItem = {
            id: Date.now().toString(),
            number: invitation.remoteIdentity.uri.user || 'Unknown',
            direction: 'incoming',
            status: 'rejected',
            timestamp: new Date()
          };
          
          if (this.onCallHistoryUpdate) {
            this.onCallHistoryUpdate(newCall);
          }
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
              const duration = this.callStartTime ? Math.floor((Date.now() - this.callStartTime) / 1000) : 0;
              this.updateState({
                isCalling: false,
                isInCall: false,
                callStatus: 'Ready',
                isMuted: false,
                isOnHold: false
              });
              // Reset call start time
              this.callStartTime = 0;
              
              // Add to call history
              const completedCall: CallHistoryItem = {
                id: Date.now().toString(),
                number: phoneNumber,
                direction: 'outgoing',
                status: 'completed',
                timestamp: new Date(),
                duration
              };
              
              if (this.onCallHistoryUpdate) {
                this.onCallHistoryUpdate(completedCall);
              }
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
    if (this.session) {
      try {
        if (this.session.state === SessionState.Established || this.session.state === SessionState.Initial) {
          await this.session.bye();
        } else {
          this.session.cancel();
        }
      } catch (error) {
        console.error('Error ending call:', error);
        // Force state update
        this.updateState({
          isCalling: false,
          isInCall: false,
          callStatus: 'Ready',
          isMuted: false,
          isOnHold: false
        });
        // Reset call start time
        this.callStartTime = 0;
      }
    }
  }
  
  // Toggle mute
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
  
  // Cleanup
  public async cleanup() {
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
  }
  
  // Update state and notify listeners
  private updateState(newState: Partial<SipServiceState>) {
    this.state = { ...this.state, ...newState };
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }
}

export default SipService;
