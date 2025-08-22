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
    <div className="flex justify-center flex-col">
      {/* Show mute and hold buttons only during a call */}
      {(isInCall || isCalling) && (
        <div className="flex gap-2 flex-row justify-between p-4 items-center">
          <button 
            className={`p-3 border-none rounded-full text-base font-medium cursor-pointer transition-all min-w-[100px] ${isMuted ? 'bg-blue-500 text-white' : 'bg-[var(--input-bg)] text-[var(--text-color)] border border-[var(--input-border)]'}`}
            onClick={onMuteToggle}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <div className="text-xl font-medium min-w-[60px] text-center">
            {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
          </div>
          <button 
            className={`p-3 border-none rounded-full text-base font-medium cursor-pointer transition-all min-w-[100px] ${isOnHold ? 'bg-blue-500 text-white' : 'bg-[var(--input-bg)] text-[var(--text-color)] border border-[var(--input-border)]'}`}
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
          className="p-4 text-xl border-none rounded-full cursor-pointer w-full min-w-[150px] font-bold h-[50px] bg-[var(--call-btn-bg)] text-[var(--call-btn-text)] disabled:bg-[var(--disabled-btn-bg)] disabled:text-[var(--disabled-btn-text)] disabled:cursor-not-allowed"
        >
          Call
        </button>
      ) : (
        <button 
          onClick={onEndCall}
          className="p-4 text-xl border-none rounded-full cursor-pointer w-full min-w-[150px] font-bold h-[50px] bg-[var(--hangup-btn-bg)] text-[var(--hangup-btn-text)]"
        >
          Hang Up
        </button>
      )}
    </div>
  );
};
