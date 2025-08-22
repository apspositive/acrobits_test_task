import { useState } from 'react';
import type { CallHistoryItem } from '../services/sipService';

interface HistoryScreenProps {
  callHistory: CallHistoryItem[];
  onBack: () => void;
}

export const HistoryScreen = ({ callHistory, onBack }: HistoryScreenProps) => {
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  
  const filteredHistory = callHistory.filter(call => 
    filter === 'all' || call.direction === filter
  );
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date: Date) => {
    const today = new Date();
    const callDate = new Date(date);
    
    if (callDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    return callDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
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
            <div key={call.id} className="history-item">
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
