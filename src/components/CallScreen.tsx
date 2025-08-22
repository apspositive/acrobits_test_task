import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { StatusBar } from './StatusBar';
import { CallControls } from './CallControls';
import type { RootState } from '../store';

interface CallScreenProps {
  calleeNumber: string;
  onEndCall: () => void;
  onMuteToggle: () => void;
  onHoldToggle: () => void;
  onPlaceCall: () => void;
}

export const CallScreen = ({
  calleeNumber,
  onEndCall,
  onPlaceCall
}: CallScreenProps) => {
  const [callDuration, setCallDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Redux hooks
  const sipState = useSelector((state: RootState) => state.sip);
  const { 
    isConnected, 
    isRegistered, 
    isMuted, 
    isOnHold,
    callStartTime
  } = sipState;

  // Update call duration every second
  useEffect(() => {
    // Reset call duration when call starts
    if (callStartTime > 0) {
      setCallDuration(0);
      intervalRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callStartTime]);

  return (
    <div className="text-center flex-1 flex flex-col min-h-[640px] max-h-[100svh]">
      {/* Connection Status */}
      <StatusBar isConnected={isConnected} isRegistered={isRegistered} />
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Calling</h2>
      </div>
      
      <div className="mb-8">
        <div className="text-3xl font-bold">{calleeNumber}</div>
      </div>
      
      <div className="p-4 my-4 bg-[var(--status-bar-bg)] rounded font-medium min-h-8 flex items-center justify-center">
        {isOnHold ? 'On Hold' : isMuted ? 'Muted' : `Connected (${Math.floor(callDuration / 60).toString().padStart(2, '0')}:${(callDuration % 60).toString().padStart(2, '0')})`}
      </div>
      
      <CallControls
        onPlaceCall={onPlaceCall}
        onEndCall={onEndCall}
        phoneNumber={calleeNumber}
      />
    </div>
  );
};
