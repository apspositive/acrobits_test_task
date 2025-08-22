import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface CallControlsProps {
  phoneNumber: string;
  onPlaceCall: () => void;
  onEndCall: () => void;
}

export const CallControls = ({ 
  phoneNumber, 
  onPlaceCall, 
  onEndCall
}: CallControlsProps) => {
  // Redux hooks
  const sipState = useSelector((state: RootState) => state.sip);
  const { 
    isConnected, 
    isRegistered, 
    isCalling, 
    isInCall, 
    isMuted,
    isOnHold,
    callStartTime
  } = sipState;
  
  // Calculate call duration
  const callDuration = callStartTime > 0 ? Math.floor((Date.now() - callStartTime) / 1000) : 0;
  
  // Validate phone number (min 4 digits, numbers only)
  const isValidPhoneNumber = (number: string): boolean => {
    return /^\d{4,}$/.test(number);
  };
  
  // Define toggle functions
  const onMuteToggle = () => {
    // This will be implemented in the parent component
  };
  
  const onHoldToggle = () => {
    // This will be implemented in the parent component
  };
  
  return (
    <div className="call-controls">
      {/* Show mute and hold buttons only during a call */}
      {(isInCall || isCalling) && (
        <div className="call-options">
          <button 
            className={`control-button mute-button ${isMuted ? 'active' : ''}`}
            onClick={onMuteToggle}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <div className="call-duration-display">
            {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
          </div>
          <button 
            className={`control-button hold-button ${isOnHold ? 'active' : ''}`}
            onClick={onHoldToggle}
          >
            {isOnHold ? 'Resume' : 'Hold'}
          </button>
        </div>
      )}
      
      {!isInCall && !isCalling ? (
        <button 
          onClick={onPlaceCall}
          disabled={!isRegistered || !isConnected || !phoneNumber || !isValidPhoneNumber(phoneNumber)}
          className="call-button"
        >
          Call
        </button>
      ) : (
        <button 
          onClick={onEndCall}
          className="hangup-button"
        >
          Hang Up
        </button>
      )}
    </div>
  );
};
