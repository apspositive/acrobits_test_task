import { useState, useEffect } from 'react';
import { SipService } from '../services/sipService';
import type { CallHistoryItem } from '../services/sipService';
import { StatusBar } from './StatusBar';
import { DialPad } from './DialPad';
import { CallControls } from './CallControls';
import { CallHistory } from './CallHistory';
import { CallScreen } from './CallScreen';
import { HistoryScreen } from './HistoryScreen';
import sipConfig from '../sipConfig';

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
  
  // Call history
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  
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
      
      // Show call screen when in call or calling
      if (state.isInCall || state.isCalling) {
        setShowCallScreen(true);
      } else if (!state.isInCall && !state.isCalling) {
        setShowCallScreen(false);
      }
    });
    
    // Set up call history listener
    sipService.setOnCallHistoryUpdate((call) => {
      setCallHistory(prev => [call, ...prev]);
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
      {showCallScreen ? (
        <CallScreen 
          calleeNumber={phoneNumber}
          onEndCall={endCall}
          onMuteToggle={toggleMute}
          onHoldToggle={toggleHold}
          isMuted={isMuted}
          isOnHold={isOnHold}
          callStartTime={sipService.getCallDuration()}
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
          <CallHistory callHistory={callHistory} />
        </>
      )}
    </div>
  );
};
