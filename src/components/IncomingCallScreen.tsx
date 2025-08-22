// React
import { useState, useEffect } from 'react';

// Helpers and utilities
import { BUTTON_TEXT } from '../helpers/constants';

interface IncomingCallScreenProps {
  callerNumber: string;
  onAccept: () => void;
  onReject: () => void;
  onIgnore: () => void;
}

export const IncomingCallScreen = ({
  callerNumber,
  onAccept,
  onReject,
  onIgnore
}: IncomingCallScreenProps) => {
  const [timeLeft, setTimeLeft] = useState(30); // Auto-reject after 30 seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onIgnore();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onIgnore]);

  return (
    <div className="incoming-call-screen">
      <div className="screen-content">
        <h2>Incoming Call</h2>
        <div className="caller-number">{callerNumber}</div>
        <div className="auto-reject-timer">Auto-reject in {timeLeft}s</div>
        <div className="screen-actions">
          <button className="accept-button" onClick={onAccept}>
            {BUTTON_TEXT.ACCEPT}
          </button>
          <button className="reject-button" onClick={onReject}>
            {BUTTON_TEXT.REJECT}
          </button>
          <button className="ignore-button" onClick={onIgnore}>
            {BUTTON_TEXT.IGNORE}
          </button>
        </div>
      </div>
    </div>
  );
};
