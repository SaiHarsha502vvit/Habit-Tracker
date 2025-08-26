import { configureStore } from '@reduxjs/toolkit'
import habitsReducer from '../features/habits/habitsSlice'
import pomodoroSetsReducer from '../features/pomodoroSets/pomodoroSetsSlice'

/**
 * Redux store configuration with Redux Toolkit
 */
export const store = configureStore({
  reducer: {
    habits: habitsReducer,
    pomodoroSets: pomodoroSetsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
