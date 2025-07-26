import axios from 'axios'

/**
 * Axios instance configured with base URL from environment
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
