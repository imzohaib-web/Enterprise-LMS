import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Redux Toolkit requires at least one reducer on initialization
    _dummy: (state = {}) => state,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
