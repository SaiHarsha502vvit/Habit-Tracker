import { useState, useEffect, useRef, useCallback } from 'react'
import notificationService from '../services/notificationService'
import { logPomodoroSession, getWorkSessionCount } from '../services/api'

/**
 * Custom hook for managing timer sessions
 * Handles timer state, persistence, browser tab notifications, and Pomodoro session tracking
 */
export function useTimerSession() {
  const [sessions, setSessions] = useState({})
  const [sessionCounts, setSessionCounts] = useState({}) // Track session counts per habit
  const intervalsRef = useRef({})
  const originalTitleRef = useRef(document.title)
  const warningShownRef = useRef({}) // Track which sessions have shown warnings

  // Load session counts when component mounts
  useEffect(() => {
    const loadSessionCounts = async () => {
      const today = new Date().toISOString().split('T')[0]
      const counts = {}
      
      // Get current session counts for all active habits
      for (const sessionId in sessions) {
        const session = sessions[sessionId]
        if (session && session.habitId) {
          try {
            const result = await getWorkSessionCount(session.habitId, today)
            counts[session.habitId] = result.count || 0
          } catch (error) {
            console.error('Failed to load session count for habit', session.habitId, error)
            counts[session.habitId] = 0
          }
        }
      }
      
      setSessionCounts(prev => ({ ...prev, ...counts }))
    }

    if (Object.keys(sessions).length > 0) {
      loadSessionCounts()
    }
  }, [sessions])

  /**
   * Start a timer session for a habit
   */
  const startSession = useCallback((habitId, durationMinutes, habitName) => {
    const sessionId = `${habitId}-${Date.now()}`
    const totalSeconds = durationMinutes * 60
    
    // Initialize session state
    const newSession = {
      id: sessionId,
      habitId,
      habitName,
      durationMinutes,
      totalSeconds,
      remainingSeconds: totalSeconds,
      isRunning: true,
      isPaused: false,
      isCompleted: false,
      startTime: Date.now(),
      pausedTime: 0,
    }

    setSessions(prev => ({
      ...prev,
      [sessionId]: newSession
    }))

    // Reset warning tracking for this session
    warningShownRef.current[sessionId] = false

    // Start the interval
    const interval = setInterval(() => {
      setSessions(prev => {
        const session = prev[sessionId]
        if (!session || !session.isRunning || session.isPaused) {
          return prev
        }

        const newRemainingSeconds = session.remainingSeconds - 1

        // Update browser title with countdown
        const minutes = Math.floor(newRemainingSeconds / 60)
        const seconds = newRemainingSeconds % 60
        document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - ${session.habitName}`

        // Show warning notification at 5 minutes remaining (for sessions > 10 minutes)
        if (newRemainingSeconds === 300 && session.totalSeconds > 600 && !warningShownRef.current[sessionId]) {
          notificationService.notifyTimerWarning(5)
          warningShownRef.current[sessionId] = true
        }

        // Show warning notification at 1 minute remaining
        if (newRemainingSeconds === 60 && !warningShownRef.current[sessionId]) {
          notificationService.notifyTimerWarning(1)
          warningShownRef.current[sessionId] = true
        }

        if (newRemainingSeconds <= 0) {
          // Session completed
          console.log('⏰ Timer hook: Timer reached zero!', { sessionId, habitId: session.habitId, habitName: session.habitName })
          
          clearInterval(intervalsRef.current[sessionId])
          delete intervalsRef.current[sessionId]
          
          // Reset browser title
          document.title = originalTitleRef.current
          
          // Log the completed Pomodoro session
          const logSession = async () => {
            try {
              await logPomodoroSession(session.habitId, 'WORK', session.durationMinutes)
              
              // Update session count
              const today = new Date().toISOString().split('T')[0]
              const result = await getWorkSessionCount(session.habitId, today)
              const newCount = result.count || 0
              
              setSessionCounts(prev => ({
                ...prev,
                [session.habitId]: newCount
              }))
              
              // Show notification with session count
              notificationService.notifyPomodoroComplete(session.habitName, newCount)
              
              console.log('✅ Pomodoro session logged successfully', { habitId: session.habitId, count: newCount })
            } catch (error) {
              console.error('❌ Failed to log Pomodoro session:', error)
              // Still show notification even if logging fails
              notificationService.notifyPomodoroComplete(session.habitName, sessionCounts[session.habitId] + 1)
            }
          }
          
          logSession()

          console.log('⏰ Timer hook: Setting isCompleted = true', { sessionId })

          return {
            ...prev,
            [sessionId]: {
              ...session,
              remainingSeconds: 0,
              isRunning: true, // Keep running until user closes the session
              isCompleted: true,
            }
          }
        }

        return {
          ...prev,
          [sessionId]: {
            ...session,
            remainingSeconds: newRemainingSeconds,
          }
        }
      })
    }, 1000)

    intervalsRef.current[sessionId] = interval
    return sessionId
  }, [sessionCounts])

  /**
   * Pause a timer session
   */
  const pauseSession = useCallback((sessionId) => {
    setSessions(prev => {
      const session = prev[sessionId]
      if (!session) return prev

      if (session.isRunning && !session.isPaused) {
        // Reset browser title when pausing
        document.title = originalTitleRef.current
        
        return {
          ...prev,
          [sessionId]: {
            ...session,
            isPaused: true,
            pausedTime: Date.now(),
          }
        }
      }
      return prev
    })
  }, [])

  /**
   * Resume a paused timer session
   */
  const resumeSession = useCallback((sessionId) => {
    setSessions(prev => {
      const session = prev[sessionId]
      if (!session) return prev

      if (session.isRunning && session.isPaused) {
        return {
          ...prev,
          [sessionId]: {
            ...session,
            isPaused: false,
          }
        }
      }
      return prev
    })
  }, [])

  /**
   * Stop and remove a timer session
   */
  const stopSession = useCallback((sessionId) => {
    // Clear interval
    if (intervalsRef.current[sessionId]) {
      clearInterval(intervalsRef.current[sessionId])
      delete intervalsRef.current[sessionId]
    }

    // Reset browser title
    document.title = originalTitleRef.current

    // Remove session
    setSessions(prev => {
      const newSessions = { ...prev }
      delete newSessions[sessionId]
      return newSessions
    })
  }, [])

  /**
   * Get session by ID
   */
  const getSession = useCallback((sessionId) => {
    return sessions[sessionId] || null
  }, [sessions])

  /**
   * Get active session for a habit (including completed sessions until manually stopped)
   */
  const getActiveSession = useCallback((habitId) => {
    return Object.values(sessions).find(
      session => session.habitId === habitId && session.isRunning
    ) || null
  }, [sessions])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    const currentIntervals = intervalsRef.current
    const originalTitle = originalTitleRef.current
    
    return () => {
      // Clear all intervals
      Object.values(currentIntervals).forEach(interval => {
        clearInterval(interval)
      })
      
      // Reset browser title
      document.title = originalTitle
    }
  }, [])

  /**
   * Start a break session (short or long break)
   */
  const startBreakSession = useCallback((habitId, durationMinutes, habitName, breakType = 'short') => {
    const sessionId = `${habitId}-break-${Date.now()}`
    const totalSeconds = durationMinutes * 60
    
    // Show break notification
    notificationService.notifyBreakTime(breakType, durationMinutes)
    
    // Initialize break session state
    const newSession = {
      id: sessionId,
      habitId,
      habitName,
      durationMinutes,
      totalSeconds,
      remainingSeconds: totalSeconds,
      isRunning: true,
      isPaused: false,
      isCompleted: false,
      isBreakSession: true,
      breakType,
      startTime: Date.now(),
      pausedTime: 0,
    }

    setSessions(prev => ({
      ...prev,
      [sessionId]: newSession
    }))

    // Start the interval
    const interval = setInterval(() => {
      setSessions(prev => {
        const session = prev[sessionId]
        if (!session || !session.isRunning || session.isPaused) {
          return prev
        }

        const newRemainingSeconds = session.remainingSeconds - 1

        // Update browser title with countdown
        const minutes = Math.floor(newRemainingSeconds / 60)
        const seconds = newRemainingSeconds % 60
        const breakEmoji = breakType === 'short' ? '☕' : '🧘'
        document.title = `${breakEmoji} ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - Break`

        if (newRemainingSeconds <= 0) {
          // Break completed
          clearInterval(intervalsRef.current[sessionId])
          delete intervalsRef.current[sessionId]
          
          // Reset browser title
          document.title = originalTitleRef.current
          
          // Log the break session
          const logSession = async () => {
            try {
              const sessionType = breakType === 'short' ? 'SHORT_BREAK' : 'LONG_BREAK'
              await logPomodoroSession(session.habitId, sessionType, session.durationMinutes)
              console.log('✅ Break session logged successfully', { habitId: session.habitId, type: sessionType })
            } catch (error) {
              console.error('❌ Failed to log break session:', error)
            }
          }
          
          logSession()
          
          // Show completion notification
          notificationService.showNotification('🔔 Break Complete!', {
            body: `Time to get back to work on "${session.habitName}"`,
            icon: '🔔'
          })
          notificationService.playSound('completion')

          return {
            ...prev,
            [sessionId]: {
              ...session,
              remainingSeconds: 0,
              isRunning: true,
              isCompleted: true,
            }
          }
        }

        return {
          ...prev,
          [sessionId]: {
            ...session,
            remainingSeconds: newRemainingSeconds,
          }
        }
      })
    }, 1000)

    intervalsRef.current[sessionId] = interval
    return sessionId
  }, [])

  /**
   * Get session count for a habit
   */
  const getSessionCount = useCallback((habitId) => {
    return sessionCounts[habitId] || 0
  }, [sessionCounts])

  return {
    sessions,
    sessionCounts,
    startSession,
    startBreakSession,
    pauseSession,
    resumeSession,
    stopSession,
    getSession,
    getActiveSession,
    getSessionCount,
  }
}
