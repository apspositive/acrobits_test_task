interface CallHistoryItem {
  id: string;
  number: string;
  direction: 'incoming' | 'outgoing';
  status: 'completed' | 'missed' | 'rejected' | 'in-progress';
  timestamp: Date | string;
  duration?: number;
}

interface CallHistoryProps {
  callHistory: CallHistoryItem[];
  onCall?: (number: string) => void;
}

export const CallHistory = ({ callHistory, onCall }: CallHistoryProps) => {
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="mt-8 text-left max-h-[240px] overflow-y-auto">
      <h2 className="border-b border-[var(--history-border)] pb-2 mb-4">Call History</h2>
      {callHistory.length === 0 ? (
        <p className="text-center text-[var(--text-color)] italic p-8 opacity-70">No calls yet</p>
      ) : (
        <ul className="list-none p-0 m-0">
          {callHistory.map((call) => (
            <li 
              key={call.id} 
              className="flex justify-between p-4 border-b border-[var(--history-border)]"
              onClick={() => onCall && onCall(call.number)}
              style={{ cursor: onCall ? 'pointer' : 'default' }}
            >
              <div className="flex items-center gap-2">
                <span className={`font-bold ${call.direction === 'outgoing' ? 'text-[var(--connected-color)]' : 'text-blue-500'}`}>
                  {call.direction === 'outgoing' ? '↑' : '↓'}
                </span>
                <span className="font-medium">{call.number}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[var(--text-color)] text-sm opacity-70">{formatTime(call.timestamp)}</span>
                <span className={`text-xs p-1 rounded text-uppercase ${call.status === 'completed' ? 'bg-[var(--completed-bg)] text-[var(--completed-text)]' : call.status === 'missed' ? 'bg-[var(--missed-bg)] text-[var(--missed-text)]' : call.status === 'rejected' ? 'bg-[var(--rejected-bg)] text-[var(--rejected-text)]' : 'bg-[var(--in-progress-bg)] text-[var(--in-progress-text)]'}`}>
                  {call.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
