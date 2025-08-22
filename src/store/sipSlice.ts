import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SipState {
  isConnected: boolean;
  isRegistered: boolean;
  isCalling: boolean;
  isInCall: boolean;
  callStatus: string;
  isMuted: boolean;
  isOnHold: boolean;
  callerNumber?: string;
  callStartTime: number;
}

const initialState: SipState = {
  isConnected: false,
  isRegistered: false,
  isCalling: false,
  isInCall: false,
  callStatus: 'Ready',
  isMuted: false,
  isOnHold: false,
  callerNumber: undefined,
  callStartTime: 0,
};

export const sipSlice = createSlice({
  name: 'sip',
  initialState,
  reducers: {
    updateSipState: (state, action: PayloadAction<Partial<SipState>>) => {
      return { ...state, ...action.payload };
    },
    setCallerNumber: (state, action: PayloadAction<string | undefined>) => {
      state.callerNumber = action.payload;
    },
    resetCallState: (state) => {
      state.isCalling = false;
      state.isInCall = false;
      state.callStatus = 'Ready';
      state.isMuted = false;
      state.isOnHold = false;
      state.callerNumber = undefined;
      state.callStartTime = 0;
    },
  },
});

export const { updateSipState, setCallerNumber, resetCallState } = sipSlice.actions;

export default sipSlice.reducer;
