import { configureStore } from '@reduxjs/toolkit'
import habitsReducer from '../features/habits/habitsSlice'

/**
 * Redux store configuration with Redux Toolkit
 */
export const store = configureStore({
  reducer: {
    habits: habitsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
