import axios from 'axios'

/**
 * Axios instance configured with base URL from environment
 * Enhanced with Phase 1 authentication support
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove invalid token but don't redirect - graceful degradation
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

/**
 * Authentication API functions (Phase 1)
 */

/**
 * Helper to set auth token in localStorage
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token)
  } else {
    localStorage.removeItem('token')
  }
}

/**
 * Helper to set user data in localStorage
 */
export const setUserData = (userData) => {
  if (userData) {
    localStorage.setItem('user', JSON.stringify(userData))
  } else {
    localStorage.removeItem('user')
  }
}

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me')
  return response.data
}

/**
 * Register new user
 */
export const registerUser = async (userData) => {
  console.log('🔗 API: Registering user...', userData)
  const response = await api.post('/api/auth/register', userData)
  console.log('🔗 API: Registration response:', response.data)
  return response.data
}

/**
 * Login user
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials)
  return response.data
}

/**
 * Category API functions (Phase 1)
 */

/**
 * Get all categories
 */
export const getCategories = async () => {
  try {
    const response = await api.get('/api/categories')
    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      // Authentication required for categories
      return []
    }
    throw new Error(error.response?.data?.message || 'Failed to load categories')
  }
}

/**
 * Create new category
 */
export const createCategory = async (categoryData) => {
  const response = await api.post('/api/categories', categoryData)
  return response.data
}

/**
 * Get timer presets
 */
export const getTimerPresets = async () => {
  try {
    // For now, return static presets - can be made dynamic later
    return {
      POMODORO_CLASSIC: {
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        description: "🍅 Pomodoro Classic (25min)"
      },
      POMODORO_EXTENDED: {
        workMinutes: 50,
        shortBreakMinutes: 10,
        longBreakMinutes: 30,
        description: "🍅 Pomodoro Extended (50min)"
      },
      DEEP_WORK: {
        workMinutes: 90,
        shortBreakMinutes: 20,
        longBreakMinutes: 30,
        description: "🧠 Deep Work (90min)"
      },
      TIMEBOXING: {
        workMinutes: 60,
        shortBreakMinutes: 10,
        longBreakMinutes: 20,
        description: "⏰ Timeboxing (60min)"
      },
      CUSTOM: {
        workMinutes: 25,
        description: "✏️ Custom Duration"
      }
    }
  } catch (error) {
    console.log('Timer presets not available:', error.message)
    return {}
  }
}

/**
 * Get analytics data
 */
export const getAnalytics = async (dateRange = 'week') => {
  try {
    const response = await api.get(`/api/analytics?range=${dateRange}`)
    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      // Return basic analytics for unauthenticated users
      return {
        totalHabits: 0,
        completedToday: 0,
        currentStreak: 0,
        weeklyProgress: []
      }
    }
    throw new Error(error.response?.data?.message || 'Failed to load analytics')
  }
}

/**
 * API functions for habit-related operations
 */

/**
 * Create a new habit
 */
export const createHabit = async (habitData) => {
  const response = await api.post('/api/habits', habitData)
  return response.data
}

/**
 * Get all habits
 */
export const getHabits = async () => {
  const response = await api.get('/api/habits')
  return response.data
}

/**
 * Delete a habit
 */
export const deleteHabit = async (habitId) => {
  const response = await api.delete(`/api/habits/${habitId}`)
  return response.data
}

/**
 * Log a habit completion
 */
export const logCompletion = async (habitId, date) => {
  const response = await api.post(`/api/habits/${habitId}/logs`, {
    completionDate: date
  })
  return response.data
}

/**
 * Get completion logs for a habit in a specific year
 */
export const getLogsForYear = async (habitId, year) => {
  const response = await api.get(`/api/habits/${habitId}/logs?year=${year}`)
  return response.data
}

export default api
