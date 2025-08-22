interface CallHistoryItem {
  id: string;
  number: string;
  direction: 'incoming' | 'outgoing';
  status: 'completed' | 'missed' | 'rejected' | 'in-progress';
  timestamp: Date;
  duration?: number;
}

interface CallHistoryProps {
  callHistory: CallHistoryItem[];
}

export const CallHistory = ({ callHistory }: CallHistoryProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="call-history">
      <h2>Call History</h2>
      {callHistory.length === 0 ? (
        <p className="no-history">No calls yet</p>
      ) : (
        <ul className="history-list">
          {callHistory.map((call) => (
            <li key={call.id} className="history-item">
              <div className="history-details">
                <span className={`direction ${call.direction}`}>
                  {call.direction === 'outgoing' ? '↑' : '↓'}
                </span>
                <span className="number">{call.number}</span>
              </div>
              <div className="history-meta">
                <span className="time">{formatTime(call.timestamp)}</span>
                <span className={`status ${call.status}`}>
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
