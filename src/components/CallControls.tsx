// React Redux
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

// Helpers and utilities
import { isValidPhoneNumber, formatDuration } from '../helpers/utils';
import { BUTTON_TEXT } from '../helpers/constants';

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
            {isMuted ? BUTTON_TEXT.UNMUTE : BUTTON_TEXT.MUTE}
          </button>
          <div className="call-duration-display">
            {formatDuration(callDuration)}
          </div>
          <button 
            className={`control-button hold-button ${isOnHold ? 'active' : ''}`}
            onClick={onHoldToggle}
          >
            {isOnHold ? BUTTON_TEXT.RESUME : BUTTON_TEXT.HOLD}
          </button>
        </div>
      )}
      
      {!isInCall && !isCalling ? (
        <button 
          onClick={onPlaceCall}
          disabled={!isRegistered || !isConnected || !phoneNumber || !isValidPhoneNumber(phoneNumber)}
          className="call-button"
        >
          {BUTTON_TEXT.CALL}
        </button>
      ) : (
        <button 
          onClick={onEndCall}
          className="hangup-button"
        >
          {BUTTON_TEXT.HANG_UP}
        </button>
      )}
    </div>
  );
};
