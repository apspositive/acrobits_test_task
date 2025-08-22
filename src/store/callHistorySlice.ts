// Redux toolkit
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { CallDirection, CallStatus } from '../helpers/types';

export interface CallHistoryItem {
  id: string;
  number: string;
  direction: CallDirection;
  status: CallStatus;
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
  },
});

export const { addCall } = callHistorySlice.actions;

export default callHistorySlice.reducer;
