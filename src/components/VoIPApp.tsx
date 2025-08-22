import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Local components
import { StatusBar } from './StatusBar';
import { DialPad } from './DialPad';
import { CallControls } from './CallControls';
import { CallHistory } from './CallHistory';
import { CallScreen } from './CallScreen';
import { HistoryScreen } from './HistoryScreen';
import { IncomingCallScreen } from './IncomingCallScreen';
import { ThemeProvider } from './ThemeProvider';

// Services and configuration
import { SipService } from '../services/sipService';
import sipConfig from '../sipConfig';

// Store and state management
import { setCallerNumber, resetCallState } from '../store/sipSlice';
import type { RootState, AppDispatch } from '../store';

// Helpers and utilities
import { parseSipUri, isValidPhoneNumber } from '../helpers/utils';
import { CALL_STATUS, SCREEN } from '../helpers/constants';

export const VoIPApp = () => {
  // ======================================================================
  // STATE MANAGEMENT
  // ======================================================================
  
  // Local component state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'main' | 'history'>(SCREEN.MAIN);
  const [incomingCall, setIncomingCall] = useState(false);
  
  // Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const sipState = useSelector((state: RootState) => state.sip);
  const callHistory = useSelector((state: RootState) => state.callHistory.calls);
  
  // Extract SIP state values for easier access
  const { 
    isConnected,     // Whether we have a connection to the SIP server
    isRegistered,    // Whether we are registered with the SIP server
    callStatus,      // Current call status message
    callerNumber     // Number of the incoming caller (if any)
  } = sipState;
  
  // ======================================================================
  // SIP SERVICE INITIALIZATION
  // ======================================================================
  
  // Initialize SIP service with user credentials
  const [sipService] = useState(() => {
    const { username, domain } = parseSipUri(sipConfig.user1.uri);
    return new SipService(username, domain);
  });
  
  // Initialize SIP service on component mount
  useEffect(() => {
    // Set up state change listener - now handled by Redux in SipService
    sipService.setOnStateChange();
    
    // Set up call history listener - now handled by Redux in SipService
    sipService.setOnCallHistoryUpdate();
    
    // Initialize SIP service
    sipService.initialize();
    
    // Cleanup on unmount
    return () => {
      sipService.cleanup();
    };
  }, [sipService, dispatch]);
  
  
  // ======================================================================
  // CALL MANAGEMENT METHODS
  // ======================================================================
  
  /**
   * Place outgoing call
   * Validates phone number before placing call
   */
  const placeCall = async () => {
    // Only place call if validation passes
    if (isValidPhoneNumber(phoneNumber)) {
      await sipService.placeCall(phoneNumber);
    }
  };
  
  /**
   * End current call
   * Uses useCallback to prevent unnecessary re-renders
   */
  const endCall = useCallback(async () => {
    console.log('Ending call from UI');
    await sipService.endCall();
    dispatch(resetCallState());
  }, [sipService, dispatch]);
  
  // Update UI state based on Redux state
  useEffect(() => {
    console.log('SIP State updated:', sipState);
    // Handle incoming call notifications
    if (sipState.isCalling && !sipState.isInCall && sipState.callStatus.startsWith('Incoming call from')) {
      setIncomingCall(true);
    } else if (!sipState.isCalling || sipState.isInCall) {
      setIncomingCall(false);
    }
    
    // Show call screen when in call or calling (but not for incoming call notifications)
    if (sipState.isInCall || (sipState.isCalling && !sipState.callStatus.startsWith('Incoming call from'))) {
      setShowCallScreen(true);
    } else {
      setShowCallScreen(false);
    }
    
    console.log('UI State - showCallScreen:', showCallScreen, 'incomingCall:', incomingCall);
  }, [sipState, showCallScreen, incomingCall]);
  
  // Handle invalid call states (isInCall true but isCalling false)
  useEffect(() => {
    if (sipState.isInCall && !sipState.isCalling) {
      console.log('Invalid call state detected: isInCall true but isCalling false. Ending call automatically.');
      endCall();
    }
  }, [sipState.isInCall, sipState.isCalling, endCall]);
  
  // ======================================================================
  // INCOMING CALL METHODS
  // ======================================================================
  
  /**
   * Accept incoming call
   */
  const acceptCall = async () => {
    await sipService.acceptIncomingCall();
    setIncomingCall(false);
  };
  
  /**
   * Reject incoming call
   */
  const rejectCall = async () => {
    await sipService.rejectIncomingCall();
    setIncomingCall(false);
    dispatch(setCallerNumber(undefined));
  };
  
  /**
   * Ignore incoming call (same as reject but without explicit user action)
   */
  const ignoreCall = async () => {
    await sipService.rejectIncomingCall();
  };
  
  // ======================================================================
  // CALL CONTROL METHODS
  // ======================================================================
  
  /**
   * Toggle mute state for the current call
   */
  const toggleMute = () => {
    sipService.toggleMute();
  };
  
  /**
   * Toggle hold state for the current call
   */
  const toggleHold = () => {
    sipService.toggleHold();
  };
  
  // ======================================================================
  // RENDER METHOD
  // ======================================================================
  
  return (
    <div className="voip-container">
      <ThemeProvider>
        {incomingCall ? (
          <IncomingCallScreen
            callerNumber={callerNumber || ''}
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
              {callStatus === 'Ready' ? CALL_STATUS.READY : callStatus}
            </div>
            
            {/* Phone Number Input and Dial Pad */}
            <DialPad 
              onNumberChange={(number) => {
                // Only allow numbers in the input
                setPhoneNumber(number.replace(/[^0-9]/g, ''));
              }}
              onEnterPress={placeCall}
              currentNumber={phoneNumber}
            />
            
            {/* Call Controls */}
            <CallControls 
              onPlaceCall={placeCall}
              onEndCall={endCall}
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
