import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  createPomodoroSessionSet,
  getActivePomodoroSessionSet,
  getPomodoroSessionSet,
  updatePomodoroSessionSet,
  advancePomodoroSessionSet,
  cancelPomodoroSessionSet,
  getPomodoroSessionSetsForHabit,
  getCompletedPomodoroSessionSets,
  getPomodoroSessionSetStatistics
} from '../../services/api'

/**
 * Async thunks for Pomodoro session set operations
 */

// Create a new session set
export const createSessionSet = createAsyncThunk(
  'pomodoroSets/createSessionSet',
  async (sessionSetData, { rejectWithValue }) => {
    try {
      const sessionSet = await createPomodoroSessionSet(sessionSetData)
      return sessionSet
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create session set')
    }
  }
)

// Get active session set for a habit
export const fetchActiveSessionSet = createAsyncThunk(
  'pomodoroSets/fetchActiveSessionSet',
  async (habitId, { rejectWithValue }) => {
    try {
      const sessionSet = await getActivePomodoroSessionSet(habitId)
      return { habitId, sessionSet }
    } catch (error) {
      if (error.response?.status === 404) {
        return { habitId, sessionSet: null } // No active session set
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active session set')
    }
  }
)

// Update session set
export const updateSessionSet = createAsyncThunk(
  'pomodoroSets/updateSessionSet',
  async ({ sessionSetId, updates }, { rejectWithValue }) => {
    try {
      const sessionSet = await updatePomodoroSessionSet(sessionSetId, updates)
      return sessionSet
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update session set')
    }
  }
)

// Advance to next phase
export const advanceToNextPhase = createAsyncThunk(
  'pomodoroSets/advanceToNextPhase',
  async (sessionSetId, { rejectWithValue }) => {
    try {
      const sessionSet = await advancePomodoroSessionSet(sessionSetId)
      return sessionSet
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to advance session set')
    }
  }
)

// Cancel session set
export const cancelSessionSet = createAsyncThunk(
  'pomodoroSets/cancelSessionSet',
  async (sessionSetId, { rejectWithValue }) => {
    try {
      const sessionSet = await cancelPomodoroSessionSet(sessionSetId)
      return sessionSet
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel session set')
    }
  }
)

// Fetch session sets for habit
export const fetchSessionSetsForHabit = createAsyncThunk(
  'pomodoroSets/fetchSessionSetsForHabit',
  async (habitId, { rejectWithValue }) => {
    try {
      const sessionSets = await getPomodoroSessionSetsForHabit(habitId)
      return { habitId, sessionSets }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch session sets')
    }
  }
)

/**
 * Initial state
 */
const initialState = {
  // Active session sets by habit ID
  activeSessionSets: {}, // { [habitId]: sessionSet | null }
  
  // Session sets history by habit ID  
  sessionSetsHistory: {}, // { [habitId]: sessionSet[] }
  
  // Current timer state for active session
  currentTimer: {
    sessionSetId: null,
    isRunning: false,
    timeLeft: 0,
    totalTime: 0,
    sessionType: null, // 'WORK', 'SHORT_BREAK', 'LONG_BREAK'
    habitId: null,
    habitName: null
  },
  
  // UI state
  ui: {
    showSessionPlanning: false,
    planningHabitId: null,
    showCompletionCelebration: false,
    completedSessionSet: null
  },
  
  // Loading and error states
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
}

/**
 * Pomodoro session sets slice
 */
const pomodoroSessionSetsSlice = createSlice({
  name: 'pomodoroSets',
  initialState,
  reducers: {
    // Timer control actions
    startTimer: (state, action) => {
      const { sessionSetId, timeMinutes, sessionType, habitId, habitName } = action.payload
      state.currentTimer = {
        sessionSetId,
        isRunning: true,
        timeLeft: timeMinutes * 60,
        totalTime: timeMinutes * 60,
        sessionType,
        habitId,
        habitName
      }
    },

    pauseTimer: (state) => {
      state.currentTimer.isRunning = false
    },

    resumeTimer: (state) => {
      state.currentTimer.isRunning = true
    },

    stopTimer: (state) => {
      state.currentTimer = {
        sessionSetId: null,
        isRunning: false,
        timeLeft: 0,
        totalTime: 0,
        sessionType: null,
        habitId: null,
        habitName: null
      }
    },

    tickTimer: (state) => {
      if (state.currentTimer.isRunning && state.currentTimer.timeLeft > 0) {
        state.currentTimer.timeLeft -= 1
      }
    },

    // UI state actions
    showSessionPlanning: (state, action) => {
      state.ui.showSessionPlanning = true
      state.ui.planningHabitId = action.payload.habitId
    },

    hideSessionPlanning: (state) => {
      state.ui.showSessionPlanning = false
      state.ui.planningHabitId = null
    },

    showCompletionCelebration: (state, action) => {
      state.ui.showCompletionCelebration = true
      state.ui.completedSessionSet = action.payload.sessionSet
    },

    hideCompletionCelebration: (state) => {
      state.ui.showCompletionCelebration = false
      state.ui.completedSessionSet = null
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Create session set
      .addCase(createSessionSet.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createSessionSet.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const sessionSet = action.payload
        state.activeSessionSets[sessionSet.habitId] = sessionSet
      })
      .addCase(createSessionSet.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

      // Fetch active session set
      .addCase(fetchActiveSessionSet.fulfilled, (state, action) => {
        const { habitId, sessionSet } = action.payload
        state.activeSessionSets[habitId] = sessionSet
      })
      .addCase(fetchActiveSessionSet.rejected, (state, action) => {
        state.error = action.payload
      })

      // Update session set
      .addCase(updateSessionSet.fulfilled, (state, action) => {
        const sessionSet = action.payload
        state.activeSessionSets[sessionSet.habitId] = sessionSet
        
        // If session set is completed, show celebration
        if (sessionSet.isCompleted) {
          state.ui.showCompletionCelebration = true
          state.ui.completedSessionSet = sessionSet
        }
      })
      .addCase(updateSessionSet.rejected, (state, action) => {
        state.error = action.payload
      })

      // Advance to next phase
      .addCase(advanceToNextPhase.fulfilled, (state, action) => {
        const sessionSet = action.payload
        state.activeSessionSets[sessionSet.habitId] = sessionSet
        
        // If session set is completed, show celebration
        if (sessionSet.isCompleted) {
          state.ui.showCompletionCelebration = true
          state.ui.completedSessionSet = sessionSet
        }
      })
      .addCase(advanceToNextPhase.rejected, (state, action) => {
        state.error = action.payload
      })

      // Cancel session set
      .addCase(cancelSessionSet.fulfilled, (state, action) => {
        const sessionSet = action.payload
        state.activeSessionSets[sessionSet.habitId] = null
        // Stop current timer if it belongs to this session set
        if (state.currentTimer.sessionSetId === sessionSet.id) {
          state.currentTimer = initialState.currentTimer
        }
      })
      .addCase(cancelSessionSet.rejected, (state, action) => {
        state.error = action.payload
      })

      // Fetch session sets history
      .addCase(fetchSessionSetsForHabit.fulfilled, (state, action) => {
        const { habitId, sessionSets } = action.payload
        state.sessionSetsHistory[habitId] = sessionSets
      })
      .addCase(fetchSessionSetsForHabit.rejected, (state, action) => {
        state.error = action.payload
      })
  }
})

export const {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  tickTimer,
  showSessionPlanning,
  hideSessionPlanning,
  showCompletionCelebration,
  hideCompletionCelebration,
  clearError
} = pomodoroSessionSetsSlice.actions

// Selectors
export const selectActiveSessionSet = (state, habitId) => 
  state.pomodoroSets.activeSessionSets[habitId] || null

export const selectCurrentTimer = (state) => state.pomodoroSets.currentTimer

export const selectSessionSetsHistory = (state, habitId) => 
  state.pomodoroSets.sessionSetsHistory[habitId] || []

export const selectPomodoroSetsUI = (state) => state.pomodoroSets.ui

export const selectPomodoroSetsStatus = (state) => state.pomodoroSets.status

export const selectPomodoroSetsError = (state) => state.pomodoroSets.error

export default pomodoroSessionSetsSlice.reducer