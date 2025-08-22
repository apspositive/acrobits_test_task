// Redux toolkit
import { configureStore } from '@reduxjs/toolkit';

// Reducers
import sipReducer from './sipSlice.ts';
import callHistoryReducer from './callHistorySlice.ts';

const store = configureStore({
  reducer: {
    sip: sipReducer,
    callHistory: callHistoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
