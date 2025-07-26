import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for managing timer sessions
 * Handles timer state, persistence, and browser tab notifications
 */
export function useTimerSession() {
  const [sessions, setSessions] = useState({})
  const intervalsRef = useRef({})
  const originalTitleRef = useRef(document.title)

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

        if (newRemainingSeconds <= 0) {
          // Session completed
          console.log('⏰ Timer hook: Timer reached zero!', { sessionId, habitId: session.habitId, habitName: session.habitName })
          
          clearInterval(intervalsRef.current[sessionId])
          delete intervalsRef.current[sessionId]
          
          // Reset browser title
          document.title = originalTitleRef.current
          
          // Play completion sound (if available)
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcCEWT1O7Qf') 
            audio.play().catch(() => {}) // Ignore errors if audio fails
          } catch {
            // Audio not supported, ignore
          }

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
  }, [])

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

  return {
    sessions,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    getSession,
    getActiveSession,
  }
}
