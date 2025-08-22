import { useState, useEffect } from 'react';

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
    <div className="flex items-center justify-center min-h-[640px] max-h-[100svh]">
      <div className="text-center p-8 bg-[var(--container-bg)] rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Incoming Call</h2>
        <div className="text-3xl font-bold mb-4">{callerNumber}</div>
        <div className="p-4 my-4 bg-[var(--status-bar-bg)] rounded font-medium">
          Auto-reject in {timeLeft}s
        </div>
        <div className="flex justify-center gap-4 mt-8">
          <button 
            className="p-4 text-xl border-none rounded-full cursor-pointer w-full min-w-[100px] font-bold h-[50px] bg-green-500 text-white"
            onClick={onAccept}
          >
            Accept
          </button>
          <button 
            className="p-4 text-xl border-none rounded-full cursor-pointer w-full min-w-[100px] font-bold h-[50px] bg-red-500 text-white"
            onClick={onReject}
          >
            Reject
          </button>
          <button 
            className="p-4 text-xl border-none rounded-full cursor-pointer w-full min-w-[100px] font-bold h-[50px] bg-[var(--input-bg)] text-[var(--text-color)] border border-[var(--input-border)]"
            onClick={onIgnore}
          >
            Ignore
          </button>
        </div>
      </div>
    </div>
  );
};
