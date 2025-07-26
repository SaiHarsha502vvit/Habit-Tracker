import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from '@reduxjs/toolkit'
import { createHabit, getHabits, deleteHabit, logCompletion, getLogsForYear } from '../../services/api'

/**
 * Entity adapter for normalized state management of habits
 */
const habitsAdapter = createEntityAdapter()

/**
 * Async thunks for API operations
 */

// Fetch all habits
export const fetchHabits = createAsyncThunk(
  'habits/fetchHabits',
  async (_, { rejectWithValue }) => {
    try {
      const habits = await getHabits()
      return habits
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch habits')
    }
  }
)

// Add a new habit
export const addNewHabit = createAsyncThunk(
  'habits/addNewHabit',
  async (habitData, { rejectWithValue }) => {
    try {
      const newHabit = await createHabit(habitData)
      return newHabit
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create habit')
    }
  }
)

// Delete a habit
export const removeHabit = createAsyncThunk(
  'habits/removeHabit',
  async (habitId, { rejectWithValue }) => {
    try {
      await deleteHabit(habitId)
      return habitId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete habit')
    }
  }
)

// Log a habit completion with optimistic update
export const logHabit = createAsyncThunk(
  'habits/logHabit',
  async ({ habitId, date }, { rejectWithValue, dispatch }) => {
    try {
      const result = await logCompletion(habitId, date)
      return { habitId, date, result }
    } catch (error) {
      // Rollback optimistic update on error
      dispatch(removeOptimisticLog({ habitId, date }))
      return rejectWithValue(error.response?.data?.message || 'Failed to log habit completion')
    }
  }
)

// Fetch logs for a specific habit and year
export const fetchLogsForYear = createAsyncThunk(
  'habits/fetchLogsForYear',
  async ({ habitId, year }, { rejectWithValue }) => {
    try {
      const logs = await getLogsForYear(habitId, year)
      return { habitId, year, logs }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch logs')
    }
  }
)

/**
 * Initial state structure following the Project Constitution
 */
const initialState = {
  // Habits state managed by entity adapter
  habits: habitsAdapter.getInitialState({
    status: 'idle',
    error: null,
  }),
  
  // Logs state: { [habitId]: { completions: [], status: '', error: null } }
  logs: {}
}

/**
 * Habits slice with Redux Toolkit
 */
const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    // Optimistic update for habit logging
    addOptimisticLog: (state, action) => {
      const { habitId, date } = action.payload
      if (!state.logs[habitId]) {
        state.logs[habitId] = { completions: [], status: 'idle', error: null }
      }
      if (!state.logs[habitId].completions.includes(date)) {
        state.logs[habitId].completions.push(date)
      }
    },
    
    // Remove optimistic update on error
    removeOptimisticLog: (state, action) => {
      const { habitId, date } = action.payload
      if (state.logs[habitId]) {
        state.logs[habitId].completions = state.logs[habitId].completions.filter(d => d !== date)
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch habits
      .addCase(fetchHabits.pending, (state) => {
        state.habits.status = 'loading'
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.habits.status = 'succeeded'
        habitsAdapter.setAll(state.habits, action.payload)
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.habits.status = 'failed'
        state.habits.error = action.payload
      })
      
      // Add new habit
      .addCase(addNewHabit.pending, (state) => {
        state.habits.status = 'loading'
      })
      .addCase(addNewHabit.fulfilled, (state, action) => {
        state.habits.status = 'succeeded'
        habitsAdapter.addOne(state.habits, action.payload)
      })
      .addCase(addNewHabit.rejected, (state, action) => {
        state.habits.status = 'failed'
        state.habits.error = action.payload
      })
      
      // Remove habit
      .addCase(removeHabit.pending, (state) => {
        state.habits.status = 'loading'
      })
      .addCase(removeHabit.fulfilled, (state, action) => {
        state.habits.status = 'succeeded'
        habitsAdapter.removeOne(state.habits, action.payload)
        // Remove logs for deleted habit
        delete state.logs[action.payload]
      })
      .addCase(removeHabit.rejected, (state, action) => {
        state.habits.status = 'failed'
        state.habits.error = action.payload
      })
      
      // Log habit
      .addCase(logHabit.pending, (state, action) => {
        const { habitId, date } = action.meta.arg
        // Optimistic update
        if (!state.logs[habitId]) {
          state.logs[habitId] = { completions: [], status: 'loading', error: null }
        }
        state.logs[habitId].status = 'loading'
        if (!state.logs[habitId].completions.includes(date)) {
          state.logs[habitId].completions.push(date)
        }
      })
      .addCase(logHabit.fulfilled, (state, action) => {
        const { habitId } = action.payload
        if (state.logs[habitId]) {
          state.logs[habitId].status = 'succeeded'
          state.logs[habitId].error = null
        }
      })
      .addCase(logHabit.rejected, (state, action) => {
        const { habitId } = action.meta.arg
        if (state.logs[habitId]) {
          state.logs[habitId].status = 'failed'
          state.logs[habitId].error = action.payload
        }
      })
      
      // Fetch logs for year
      .addCase(fetchLogsForYear.pending, (state, action) => {
        const { habitId } = action.meta.arg
        if (!state.logs[habitId]) {
          state.logs[habitId] = { completions: [], status: 'loading', error: null }
        } else {
          state.logs[habitId].status = 'loading'
        }
      })
      .addCase(fetchLogsForYear.fulfilled, (state, action) => {
        const { habitId, logs } = action.payload
        state.logs[habitId] = {
          completions: logs,
          status: 'succeeded',
          error: null
        }
      })
      .addCase(fetchLogsForYear.rejected, (state, action) => {
        const { habitId } = action.meta.arg
        if (state.logs[habitId]) {
          state.logs[habitId].status = 'failed'
          state.logs[habitId].error = action.payload
        }
      })
  },
})

export const { addOptimisticLog, removeOptimisticLog } = habitsSlice.actions

// Export entity adapter selectors
export const {
  selectAll: selectAllHabits,
  selectById: selectHabitById,
  selectIds: selectHabitIds,
} = habitsAdapter.getSelectors((state) => state.habits.habits)

// Memoized selectors to prevent unnecessary re-renders
export const selectHabitsStatus = createSelector(
  [(state) => state.habits.habits.status],
  (status) => status
)

export const selectHabitsError = createSelector(
  [(state) => state.habits.habits.error],
  (error) => error
)

// Factory function for creating memoized log selectors for specific habits
export const makeSelectLogsForHabit = () => createSelector(
  [(state, habitId) => state.habits.logs[habitId]],
  (logs) => logs || { completions: [], status: 'idle', error: null }
)

export default habitsSlice.reducer
