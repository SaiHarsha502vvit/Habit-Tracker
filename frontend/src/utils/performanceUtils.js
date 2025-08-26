import { useMemo, useCallback, useRef, useEffect } from 'react'

/**
 * Performance utilities and custom hooks for optimization
 */

/**
 * Debounce hook for expensive operations
 */
export function useDebounce(callback, delay) {
  const timeoutRef = useRef()
  
  return useCallback((...args) => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => callback(...args), delay)
  }, [callback, delay])
}

/**
 * Throttle hook for high-frequency events
 */
export function useThrottle(callback, delay) {
  const lastCallRef = useRef(0)
  
  return useCallback((...args) => {
    const now = Date.now()
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now
      callback(...args)
    }
  }, [callback, delay])
}

/**
 * Memoized session statistics calculator
 */
export function useSessionStats(sessions) {
  return useMemo(() => {
    const stats = {
      totalSessions: 0,
      workSessions: 0,
      breakSessions: 0,
      totalWorkTime: 0,
      totalBreakTime: 0,
      averageSessionLength: 0
    }

    if (!sessions || sessions.length === 0) {
      return stats
    }

    sessions.forEach(session => {
      stats.totalSessions++
      
      if (session.sessionType === 'WORK') {
        stats.workSessions++
        stats.totalWorkTime += session.durationMinutes
      } else {
        stats.breakSessions++
        stats.totalBreakTime += session.durationMinutes
      }
    })

    stats.averageSessionLength = stats.totalSessions > 0 
      ? Math.round((stats.totalWorkTime + stats.totalBreakTime) / stats.totalSessions)
      : 0

    return stats
  }, [sessions])
}

/**
 * Optimized timer formatter
 */
export function useTimerFormatter() {
  return useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])
}

/**
 * Memory management hook for cleaning up resources
 */
export function useCleanup(cleanupFn) {
  const cleanupRef = useRef(cleanupFn)
  cleanupRef.current = cleanupFn

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])
}

/**
 * Performance monitor hook (for development)
 */
export function usePerformanceMonitor(componentName) {
  const renderCount = useRef(0)
  const renderTime = useRef(0)

  useEffect(() => {
    renderCount.current++
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      renderTime.current = endTime - startTime
      
      // Only log in development
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log(`🔍 ${componentName} render #${renderCount.current}: ${renderTime.current.toFixed(2)}ms`)
      }
    }
  })

  return {
    renderCount: renderCount.current,
    lastRenderTime: renderTime.current
  }
}

/**
 * Local storage hook with error handling
 */
export function useLocalStorage(key, defaultValue) {
  const getValue = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  }, [key, defaultValue])

  const setValue = useCallback((value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key])

  return [getValue(), setValue]
}