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

/**
 * Pomodoro Session API functions
 */

/**
 * Log a completed Pomodoro session
 */
export const logPomodoroSession = async (habitId, sessionType, durationMinutes) => {
  const response = await api.post('/api/pomodoro/sessions', {
    habitId,
    sessionType,
    durationMinutes
  })
  return response.data
}

/**
 * Get all sessions for a habit
 */
export const getPomodoroSessions = async (habitId) => {
  const response = await api.get(`/api/pomodoro/sessions/habit/${habitId}`)
  return response.data
}

/**
 * Get sessions for a habit on a specific date
 */
export const getPomodoroSessionsForDate = async (habitId, date) => {
  const response = await api.get(`/api/pomodoro/sessions/habit/${habitId}/date/${date}`)
  return response.data
}

/**
 * Get work session count for a habit on a specific date
 */
export const getWorkSessionCount = async (habitId, date) => {
  const response = await api.get(`/api/pomodoro/sessions/habit/${habitId}/count/date/${date}`)
  return response.data
}

/**
 * Pomodoro Session Set API functions (Enhanced Pomodoro Technique)
 */

/**
 * Create a new Pomodoro session set
 */
export const createPomodoroSessionSet = async (sessionSetData) => {
  const response = await api.post('/api/pomodoro/session-sets', sessionSetData)
  return response.data
}

/**
 * Get active session set for a habit
 */
export const getActivePomodoroSessionSet = async (habitId) => {
  const response = await api.get(`/api/pomodoro/session-sets/habit/${habitId}/active`)
  return response.data
}

/**
 * Get session set by ID
 */
export const getPomodoroSessionSet = async (sessionSetId) => {
  const response = await api.get(`/api/pomodoro/session-sets/${sessionSetId}`)
  return response.data
}

/**
 * Update session set
 */
export const updatePomodoroSessionSet = async (sessionSetId, updates) => {
  const response = await api.put(`/api/pomodoro/session-sets/${sessionSetId}`, updates)
  return response.data
}

/**
 * Advance session set to next phase
 */
export const advancePomodoroSessionSet = async (sessionSetId) => {
  const response = await api.post(`/api/pomodoro/session-sets/${sessionSetId}/advance`)
  return response.data
}

/**
 * Cancel session set
 */
export const cancelPomodoroSessionSet = async (sessionSetId) => {
  const response = await api.post(`/api/pomodoro/session-sets/${sessionSetId}/cancel`)
  return response.data
}

/**
 * Get all session sets for a habit
 */
export const getPomodoroSessionSetsForHabit = async (habitId) => {
  const response = await api.get(`/api/pomodoro/session-sets/habit/${habitId}`)
  return response.data
}

/**
 * Get completed session sets for a habit
 */
export const getCompletedPomodoroSessionSets = async (habitId) => {
  const response = await api.get(`/api/pomodoro/session-sets/habit/${habitId}/completed`)
  return response.data
}

/**
 * Get session set statistics
 */
export const getPomodoroSessionSetStatistics = async (habitId) => {
  const response = await api.get(`/api/pomodoro/session-sets/habit/${habitId}/statistics`)
  return response.data
}

/**
 * Habit Folder API functions (Phase 2 - Search & Filter System)
 */

/**
 * Create a new folder
 */
export const createHabitFolder = async (folderData) => {
  const response = await api.post('/api/folders', folderData)
  return response.data
}

/**
 * Get folder tree structure
 */
export const getFolderTree = async () => {
  const response = await api.get('/api/folders/tree')
  return response.data
}

/**
 * Get all folders (flat list)
 */
export const getAllFolders = async () => {
  const response = await api.get('/api/folders')
  return response.data
}

/**
 * Get folder by ID
 */
export const getFolderById = async (folderId) => {
  const response = await api.get(`/api/folders/${folderId}`)
  return response.data
}

/**
 * Update folder
 */
export const updateHabitFolder = async (folderId, updates) => {
  const response = await api.put(`/api/folders/${folderId}`, updates)
  return response.data
}

/**
 * Delete folder
 */
export const deleteHabitFolder = async (folderId) => {
  const response = await api.delete(`/api/folders/${folderId}`)
  return response.data
}

/**
 * Search folders by name
 */
export const searchFolders = async (searchTerm) => {
  const response = await api.get(`/api/folders/search?q=${encodeURIComponent(searchTerm)}`)
  return response.data
}

/**
 * Advanced Habit Search API functions
 */

/**
 * Quick search habits by text
 */
export const quickSearchHabits = async (searchTerm) => {
  const params = new URLSearchParams()
  if (searchTerm) params.append('q', searchTerm)
  
  const response = await api.get(`/api/habits/search/quick?${params.toString()}`)
  return response.data
}

/**
 * Advanced search habits with multiple filters
 */
export const advancedSearchHabits = async (criteria) => {
  const params = new URLSearchParams()
  
  if (criteria.searchTerm) params.append('q', criteria.searchTerm)
  if (criteria.categoryId) params.append('categoryId', criteria.categoryId)
  if (criteria.priority) params.append('priority', criteria.priority)
  if (criteria.habitType) params.append('habitType', criteria.habitType)
  if (criteria.folderId) params.append('folderId', criteria.folderId)
  if (criteria.tags && criteria.tags.length > 0) {
    criteria.tags.forEach(tag => params.append('tags', tag))
  }
  if (criteria.tagMatchAll !== undefined) params.append('tagMatchAll', criteria.tagMatchAll)
  if (criteria.createdAfter) params.append('createdAfter', criteria.createdAfter)
  if (criteria.createdBefore) params.append('createdBefore', criteria.createdBefore)
  if (criteria.sortBy) params.append('sortBy', criteria.sortBy)
  if (criteria.sortDirection) params.append('sortDirection', criteria.sortDirection)
  
  const response = await api.get(`/api/habits/search/advanced?${params.toString()}`)
  return response.data
}

/**
 * Get habits by folder
 */
export const getHabitsByFolder = async (folderId) => {
  const response = await api.get(`/api/habits/search/folder/${folderId}`)
  return response.data
}

/**
 * Get uncategorized habits
 */
export const getUncategorizedHabits = async () => {
  const response = await api.get('/api/habits/search/uncategorized')
  return response.data
}

/**
 * Get user's unique tags
 */
export const getUserTags = async () => {
  const response = await api.get('/api/habits/search/tags')
  return response.data
}

/**
 * Get search suggestions
 */
export const getSearchSuggestions = async (partialInput) => {
  const response = await api.get(`/api/habits/search/suggestions?q=${encodeURIComponent(partialInput)}`)
  return response.data
}

/**
 * Data Export/Import API functions
 */

/**
 * Export all user data
 */
export const exportUserData = async () => {
  const response = await api.get('/api/export/data', {
    responseType: 'blob'
  })
  return response.data
}

/**
 * Import user data
 */
export const importUserData = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/api/import/data', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

/**
 * Copy/Move Operations API functions
 */

/**
 * Unified copy operation for habits (Enterprise File System)
 */
export const copyHabitsToFolder = async (habitIds, targetFolderId) => {
  const response = await api.post('/api/habits/unified-copy', {
    habitIds: habitIds,
    targetFolderId: targetFolderId
  })
  return response.data
}

/**
 * Move habits to a folder (using copy + delete pattern for safety)
 */
export const moveHabitsToFolder = async (habitIds, targetFolderId) => {
  // First copy habits to target folder
  const copyResult = await copyHabitsToFolder(habitIds, targetFolderId)
  
  if (copyResult.success) {
    // If copy successful, delete original habits
    const deletePromises = habitIds.map(habitId => deleteHabit(habitId))
    await Promise.all(deletePromises)
  }
  
  return copyResult
}

export default api
