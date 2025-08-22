import { useState, useEffect } from 'react';
import { SipService } from '../services/sipService';
import type { CallHistoryItem } from '../services/sipService';
import { StatusBar } from './StatusBar';
import { DialPad } from './DialPad';
import { CallControls } from './CallControls';
import { CallHistory } from './CallHistory';
import { CallScreen } from './CallScreen';
import { HistoryScreen } from './HistoryScreen';
import { IncomingCallScreen } from './IncomingCallScreen';
import sipConfig from '../sipConfig';
import { ThemeProvider } from './ThemeProvider';

export const VoIPApp = () => {
  // State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'main' | 'history'>('main');
  const [sipService] = useState(() => {
    // Parse user1 URI to extract username and domain
    const parseURI = (uri: string) => {
      const match = uri.match(/sip:(.*?)@(.*)/);
      return match ? { username: match[1], domain: match[2] } : { username: '', domain: '' };
    };
    
    const { username, domain } = parseURI(sipConfig.user1.uri);
    return new SipService(username, domain);
  });
  
  // SIP service state
  const [isConnected, setIsConnected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callStatus, setCallStatus] = useState('Ready');
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerNumber, setCallerNumber] = useState('');
  
  // Call history
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>(() => {
    const savedHistory = localStorage.getItem('callHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('callHistory', JSON.stringify(callHistory));
  }, [callHistory]);
  
  // Initialize SIP service
  useEffect(() => {
    // Set up state change listener
    sipService.setOnStateChange((state) => {
      setIsConnected(state.isConnected);
      setIsRegistered(state.isRegistered);
      setIsCalling(state.isCalling);
      setIsInCall(state.isInCall);
      setCallStatus(state.callStatus);
      setIsMuted(state.isMuted);
      setIsOnHold(state.isOnHold);
      
      // Handle incoming call notifications
      if (state.isCalling && !state.isInCall && state.callStatus.startsWith('Incoming call from')) {
        setIncomingCall(true);
        setCallerNumber(sipService.getIncomingCallerNumber());
      } else if (!state.isCalling || state.isInCall) {
        setIncomingCall(false);
        setCallerNumber('');
      }
      
      // Show call screen when in call or calling (but not for incoming call notifications)
      if (state.isInCall || (state.isCalling && !state.callStatus.startsWith('Incoming call from'))) {
        setShowCallScreen(true);
      } else if (!state.isInCall && (!state.isCalling || !state.callStatus.startsWith('Incoming call from'))) {
        setShowCallScreen(false);
      }
    });
    
    // Set up call history listener
    sipService.setOnCallHistoryUpdate((call) => {
      setCallHistory(prev => {
        const newHistory = [call, ...prev];
        localStorage.setItem('callHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    });
    
    // Initialize SIP service
    sipService.initialize();
    
    // Cleanup on unmount
    return () => {
      sipService.cleanup();
    };
  }, [sipService]);
  
  // Place outgoing call
  const placeCall = async () => {
    await sipService.placeCall(phoneNumber);
  };
  
  // End current call
  const endCall = async () => {
    await sipService.endCall();
  };
  
  // Accept incoming call
  const acceptCall = async () => {
    await sipService.acceptIncomingCall();
  };
  
  // Reject incoming call
  const rejectCall = async () => {
    await sipService.rejectIncomingCall();
  };
  
  // Ignore incoming call (same as reject but without explicit user action)
  const ignoreCall = async () => {
    await sipService.rejectIncomingCall();
  };
  
  // Toggle mute
  const toggleMute = () => {
    sipService.toggleMute();
  };
  
  // Toggle hold
  const toggleHold = () => {
    sipService.toggleHold();
  };
  
  return (
    <div className="voip-container">
      <ThemeProvider>
        {incomingCall ? (
          <IncomingCallScreen
            callerNumber={callerNumber}
            onAccept={acceptCall}
            onReject={rejectCall}
            onIgnore={ignoreCall}
          />
        ) : showCallScreen ? (
          <CallScreen 
            calleeNumber={phoneNumber}
            onEndCall={endCall}
            onMuteToggle={toggleMute}
            onHoldToggle={toggleHold}
            isMuted={isMuted}
            isOnHold={isOnHold}
            callStartTime={sipService.getCallStartTime()}
            isConnected={isConnected}
            isRegistered={isRegistered}
            isCalling={isCalling}
            isInCall={isInCall}
            onPlaceCall={placeCall}
          />
        ) : currentScreen === 'history' ? (
          <HistoryScreen 
            callHistory={callHistory}
            onBack={() => setCurrentScreen('main')}
            onCall={setPhoneNumber}
          />
        ) : (
          <>
            <h1>VoIP Application</h1>
            
            {/* Connection Status */}
            <StatusBar isConnected={isConnected} isRegistered={isRegistered} />
            
            {/* Call Status */}
            <div className="call-status">
              {callStatus}
            </div>
            
            {/* Phone Number Input and Dial Pad */}
            <DialPad 
              onNumberChange={setPhoneNumber}
              currentNumber={phoneNumber}
            />
            
            {/* Call Controls */}
            <CallControls 
              onPlaceCall={placeCall}
              onEndCall={endCall}
              isCalling={isCalling}
              isInCall={isInCall}
              isRegistered={isRegistered}
              isConnected={isConnected}
              phoneNumber={phoneNumber}
            />
            
            {/* History Button */}
            <div className="history-button-container">
              <button 
                className="history-button"
                onClick={() => setCurrentScreen('history')}
              >
                History Log
              </button>
            </div>
            
            {/* Call History */}
            <CallHistory callHistory={callHistory} onCall={(number) => {
              setPhoneNumber(number);
              setCurrentScreen('main');
            }} />
          </>
        )}
      </ThemeProvider>
    </div>
  );
};
