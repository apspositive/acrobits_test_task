import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CallHistoryItem {
  id: string;
  number: string;
  direction: 'incoming' | 'outgoing';
  status: 'completed' | 'missed' | 'rejected' | 'in-progress';
  timestamp: Date | string;
  duration?: number;
}

interface CallHistoryState {
  calls: CallHistoryItem[];
}

const initialState: CallHistoryState = {
  calls: [],
};

export const callHistorySlice = createSlice({
  name: 'callHistory',
  initialState,
  reducers: {
    addCall: (state, action: PayloadAction<CallHistoryItem>) => {
      state.calls.unshift(action.payload);
    },
    updateCall: (state, action: PayloadAction<CallHistoryItem>) => {
      const index = state.calls.findIndex(call => call.id === action.payload.id);
      if (index !== -1) {
        state.calls[index] = action.payload;
      }
    },
    clearHistory: (state) => {
      state.calls = [];
    },
  },
});

export const { addCall, updateCall, clearHistory } = callHistorySlice.actions;

export default callHistorySlice.reducer;
