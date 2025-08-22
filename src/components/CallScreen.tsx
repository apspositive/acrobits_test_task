import { useState, useEffect, useRef } from 'react';
import { StatusBar } from './StatusBar';
import { CallControls } from './CallControls';

interface CallScreenProps {
  calleeNumber: string;
  onEndCall: () => void;
  onMuteToggle: () => void;
  onHoldToggle: () => void;
  isMuted: boolean;
  isOnHold: boolean;
  callStartTime: number;
  isConnected: boolean;
  isRegistered: boolean;
  isCalling: boolean;
  isInCall: boolean;
  onPlaceCall: () => void;
}

export const CallScreen = ({
  calleeNumber,
  onEndCall,
  onMuteToggle,
  onHoldToggle,
  isMuted,
  isOnHold,
  callStartTime,
  isConnected,
  isRegistered,
  isCalling,
  isInCall,
  onPlaceCall
}: CallScreenProps) => {
  const [callDuration, setCallDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update call duration every second
  useEffect(() => {
    if (callStartTime > 0) {
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

  // Format call duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="call-screen">
      {/* Connection Status */}
      <StatusBar isConnected={isConnected} isRegistered={isRegistered} />
      
      <div className="call-header">
        <h2>Calling</h2>
      </div>
      
      <div className="callee-info">
        <div className="callee-number">{calleeNumber}</div>
      </div>
      
      <div className="call-status">
        {isOnHold ? 'On Hold' : isMuted ? 'Muted' : 'Connected'}
      </div>
      
      <CallControls
        onPlaceCall={onPlaceCall}
        onEndCall={onEndCall}
        isCalling={isCalling}
        isInCall={isInCall}
        isRegistered={isRegistered}
        isConnected={isConnected}
        phoneNumber={calleeNumber}
        isMuted={isMuted}
        isOnHold={isOnHold}
        onMuteToggle={onMuteToggle}
        onHoldToggle={onHoldToggle}
        callDuration={callDuration}
      />
    </div>
  );
};
