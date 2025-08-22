interface CallControlsProps {
  isInCall: boolean;
  isCalling: boolean;
  isRegistered: boolean;
  isConnected: boolean;
  phoneNumber: string;
  onPlaceCall: () => void;
  onEndCall: () => void;
  isMuted?: boolean;
  isOnHold?: boolean;
  onMuteToggle?: () => void;
  onHoldToggle?: () => void;
  callDuration?: number;
}

export const CallControls = ({ 
  isInCall, 
  isCalling, 
  isRegistered, 
  isConnected, 
  phoneNumber, 
  onPlaceCall, 
  onEndCall,
  isMuted = false,
  isOnHold = false,
  onMuteToggle,
  onHoldToggle,
  callDuration = 0
}: CallControlsProps) => {
  return (
    <div className="call-controls">
      {/* Show mute and hold buttons only during a call */}
      {(isInCall || isCalling) && onMuteToggle && onHoldToggle && (
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
          disabled={!isRegistered || !isConnected || !phoneNumber}
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
