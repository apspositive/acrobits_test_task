import { useState } from 'react';
import type { CallHistoryItem } from '../services/sipService';

interface HistoryScreenProps {
  callHistory: CallHistoryItem[];
  onBack: () => void;
  onCall?: (number: string) => void;
}

export const HistoryScreen = ({ callHistory, onBack, onCall }: HistoryScreenProps) => {
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  
  const filteredHistory = callHistory.filter(call => 
    filter === 'all' || call.direction === filter
  );
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date: Date | string) => {
    const today = new Date();
    const callDate = typeof date === 'string' ? new Date(date) : date;
    
    if (callDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    return callDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="text-left flex-1 flex flex-col min-h-[640px] max-h-[100svh]">
      <div className="flex items-center mb-4 gap-4">
        <button 
          className="p-2 bg-[var(--input-bg)] text-[var(--text-color)] border border-[var(--input-border)] rounded cursor-pointer h-[50px]"
          onClick={onBack}
        >
          ← Back
        </button>
        <h2 className="m-0">Call History</h2>
      </div>
      
      <div className="flex gap-2 mb-4">
        <button 
          className={`p-2 bg-[var(--input-bg)] text-[var(--text-color)] border border-[var(--input-border)] rounded cursor-pointer h-[50px] ${filter === 'all' ? 'bg-blue-500 text-white' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`p-2 bg-[var(--input-bg)] text-[var(--text-color)] border border-[var(--input-border)] rounded cursor-pointer h-[50px] ${filter === 'incoming' ? 'bg-blue-500 text-white' : ''}`}
          onClick={() => setFilter('incoming')}
        >
          Incoming
        </button>
        <button 
          className={`p-2 bg-[var(--input-bg)] text-[var(--text-color)] border border-[var(--input-border)] rounded cursor-pointer h-[50px] ${filter === 'outgoing' ? 'bg-blue-500 text-white' : ''}`}
          onClick={() => setFilter('outgoing')}
        >
          Outgoing
        </button>
      </div>
      
      <div className="max-h-[60vh] overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="text-center p-8 text-[var(--text-color)] opacity-70">
            <p>No calls in history</p>
          </div>
        ) : (
          filteredHistory.map(call => (
            <div 
              key={call.id} 
              className="flex justify-between p-4 border-b border-[var(--history-border)]"
              onClick={() => {
                if (onCall) {
                  onCall(call.number);
                  onBack(); // Redirect to main screen
                }
              }}
              style={{ cursor: onCall ? 'pointer' : 'default' }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-lg font-medium">
                  {call.number}
                  <span className={`p-1 rounded text-xs font-bold uppercase ${call.direction === 'incoming' ? 'bg-blue-500 text-white' : 'bg-[var(--connected-color)] text-white'}`}>
                    {call.direction === 'incoming' ? 'IN' : 'OUT'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`p-1 rounded text-xs uppercase ${call.status === 'completed' ? 'bg-[var(--completed-bg)] text-[var(--completed-text)]' : call.status === 'missed' ? 'bg-[var(--missed-bg)] text-[var(--missed-text)]' : call.status === 'rejected' ? 'bg-[var(--rejected-bg)] text-[var(--rejected-text)]' : 'bg-[var(--in-progress-bg)] text-[var(--in-progress-text)]'}`}>
                    {call.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div>{formatTime(call.timestamp)}</div>
                <div className="text-sm opacity-70">{formatDate(call.timestamp)}</div>
                {call.duration !== undefined && (
                  <div className="text-sm font-medium">
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
