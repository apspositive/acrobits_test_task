// Helpers and utilities
import { formatTime } from '../helpers/utils';

import type { CallDirection, CallStatus } from '../helpers/types';

interface CallHistoryItem {
  id: string;
  number: string;
  direction: CallDirection;
  status: CallStatus;
  timestamp: Date | string;
  duration?: number;
}

interface CallHistoryProps {
  callHistory: CallHistoryItem[];
  onCall?: (number: string) => void;
}

export const CallHistory = ({ callHistory, onCall }: CallHistoryProps) => {

  return (
    <div className="call-history">
      <h2>Call History</h2>
      {callHistory.length === 0 ? (
        <p className="no-history">No calls yet</p>
      ) : (
        <ul className="history-list">
          {callHistory.map((call) => (
            <li 
              key={call.id} 
              className="history-item"
              onClick={() => onCall && onCall(call.number)}
              style={{ cursor: onCall ? 'pointer' : 'default' }}
            >
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
