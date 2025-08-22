// React
import { useState } from 'react';

// Types
import type { CallHistoryItem } from '../store/callHistorySlice';
import type { CallDirection } from '../helpers/types';

// Helpers and utilities
import { formatTime, formatDate, formatDuration } from '../helpers/utils';

interface HistoryScreenProps {
  callHistory: CallHistoryItem[];
  onBack: () => void;
  onCall?: (number: string) => void;
}

export const HistoryScreen = ({ callHistory, onBack, onCall }: HistoryScreenProps) => {
  const [filter, setFilter] = useState<'all' | CallDirection>('all');
  
  const filteredHistory = callHistory.filter(call => 
    filter === 'all' || call.direction === filter
  );
  
  
  
  return (
    <div className="history-screen">
      <div className="history-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>Call History</h2>
      </div>
      
      <div className="history-filter">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'incoming' ? 'active' : ''}
          onClick={() => setFilter('incoming')}
        >
          Incoming
        </button>
        <button 
          className={filter === 'outgoing' ? 'active' : ''}
          onClick={() => setFilter('outgoing')}
        >
          Outgoing
        </button>
      </div>
      
      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="empty-history">
            <p>No calls in history</p>
          </div>
        ) : (
          filteredHistory.map(call => (
            <div 
              key={call.id} 
              className="history-item"
              onClick={() => {
                if (onCall) {
                  onCall(call.number);
                  onBack(); // Redirect to main screen
                }
              }}
              style={{ cursor: onCall ? 'pointer' : 'default' }}
            >
              <div className="history-item-info">
                <div className="history-item-number">
                  {call.number}
                  <span className={`direction-badge ${call.direction}`}>
                    {call.direction === 'incoming' ? 'IN' : 'OUT'}
                  </span>
                </div>
                <div className="history-item-status">
                  <span className={`status-badge ${call.status}`}>
                    {call.status}
                  </span>
                </div>
              </div>
              <div className="history-item-time">
                <div>{formatTime(call.timestamp)}</div>
                <div className="history-item-date">{formatDate(call.timestamp)}</div>
                {call.duration !== undefined && (
                  <div className="history-item-duration">
                    {formatDuration(call.duration)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
