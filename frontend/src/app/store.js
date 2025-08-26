import { configureStore } from '@reduxjs/toolkit'
import habitsReducer from '../features/habits/habitsSlice'
import pomodoroSetsReducer from '../features/pomodoroSets/pomodoroSetsSlice'
import searchReducer from '../features/search/searchSlice'

/**
 * Redux store configuration with Redux Toolkit
 */
export const store = configureStore({
  reducer: {
    habits: habitsReducer,
    pomodoroSets: pomodoroSetsReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
