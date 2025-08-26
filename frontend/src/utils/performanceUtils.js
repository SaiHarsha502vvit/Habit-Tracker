import { useMemo, useCallback, useRef, useEffect, useState } from 'react'

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
 * Advanced memoized session statistics calculator with performance monitoring
 */
export function useSessionStats(sessions) {
  return useMemo(() => {
    const startTime = performance.now()
    
    const stats = {
      totalSessions: 0,
      workSessions: 0,
      breakSessions: 0,
      totalWorkTime: 0,
      totalBreakTime: 0,
      averageSessionLength: 0,
      longestStreak: 0,
      currentStreak: 0,
      productivityScore: 0,
      weeklyAverage: 0,
      monthlyTrend: []
    }

    if (!sessions || sessions.length === 0) {
      return stats
    }

    // Sort sessions by date for streak calculation
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.completedAt) - new Date(b.completedAt))

    // Calculate basic stats
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

    // Calculate advanced metrics
    stats.averageSessionLength = stats.totalSessions > 0 
      ? Math.round((stats.totalWorkTime + stats.totalBreakTime) / stats.totalSessions)
      : 0

    // Calculate streaks
    const streakData = calculateStreaks(sortedSessions)
    stats.longestStreak = streakData.longest
    stats.currentStreak = streakData.current

    // Calculate productivity score (work time / total time)
    const totalTime = stats.totalWorkTime + stats.totalBreakTime
    stats.productivityScore = totalTime > 0 
      ? Math.round((stats.totalWorkTime / totalTime) * 100)
      : 0

    // Calculate weekly average
    const weekSpan = getWeekSpan(sessions)
    stats.weeklyAverage = weekSpan > 0 ? Math.round(stats.totalSessions / weekSpan * 10) / 10 : 0

    // Calculate monthly trend
    stats.monthlyTrend = calculateMonthlyTrend(sessions)

    const endTime = performance.now()
    if (import.meta.env.DEV) {
      console.log(`📊 Session stats calculated in ${(endTime - startTime).toFixed(2)}ms`)
    }

    return stats
  }, [sessions])
}

/**
 * Calculate streaks from sorted sessions
 */
function calculateStreaks(sortedSessions) {
  if (sortedSessions.length === 0) return { longest: 0, current: 0 }
  
  let longestStreak = 1
  let currentStreak = 1
  let tempStreak = 1
  
  for (let i = 1; i < sortedSessions.length; i++) {
    const prevDate = new Date(sortedSessions[i - 1].completedAt).toDateString()
    const currDate = new Date(sortedSessions[i].completedAt).toDateString()
    
    if (prevDate !== currDate) {
      const prevDay = new Date(prevDate)
      const currDay = new Date(currDate)
      const diffTime = Math.abs(currDay - prevDay)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }
  }
  
  // Calculate current streak
  const today = new Date().toDateString()
  const lastSessionDate = new Date(sortedSessions[sortedSessions.length - 1].completedAt).toDateString()
  
  if (lastSessionDate === today || isYesterday(new Date(lastSessionDate))) {
    currentStreak = tempStreak
  } else {
    currentStreak = 0
  }
  
  return { longest: longestStreak, current: currentStreak }
}

/**
 * Check if date was yesterday
 */
function isYesterday(date) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

/**
 * Calculate week span from sessions
 */
function getWeekSpan(sessions) {
  if (sessions.length === 0) return 0
  
  const dates = sessions.map(s => new Date(s.completedAt))
  const earliest = new Date(Math.min(...dates))
  const latest = new Date(Math.max(...dates))
  
  const diffTime = Math.abs(latest - earliest)
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
  
  return Math.max(1, diffWeeks)
}

/**
 * Calculate monthly trend data
 */
function calculateMonthlyTrend(sessions) {
  const monthlyData = {}
  
  sessions.forEach(session => {
    const date = new Date(session.completedAt)
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        sessions: 0,
        workTime: 0,
        date: new Date(date.getFullYear(), date.getMonth(), 1)
      }
    }
    
    monthlyData[monthKey].sessions++
    if (session.sessionType === 'WORK') {
      monthlyData[monthKey].workTime += session.durationMinutes
    }
  })
  
  return Object.values(monthlyData)
    .sort((a, b) => a.date - b.date)
    .slice(-6) // Last 6 months
}

/**
 * Enhanced optimized timer formatter with caching
 */
export function useTimerFormatter() {
  const formatCache = useRef(new Map())
  
  return useCallback((seconds) => {
    // Check cache first
    if (formatCache.current.has(seconds)) {
      return formatCache.current.get(seconds)
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const formatted = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    
    // Cache the result
    formatCache.current.set(seconds, formatted)
    
    // Limit cache size
    if (formatCache.current.size > 1000) {
      const firstKey = formatCache.current.keys().next().value
      formatCache.current.delete(firstKey)
    }
    
    return formatted
  }, [])
}

/**
 * Enhanced memory management hook for cleaning up resources
 */
export function useCleanup(cleanupFn) {
  const cleanupRef = useRef(cleanupFn)
  const mountedRef = useRef(true)
  
  cleanupRef.current = cleanupFn

  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (cleanupRef.current) {
        try {
          cleanupRef.current()
        } catch (error) {
          console.error('Cleanup function failed:', error)
        }
      }
    }
  }, [])
  
  return mountedRef
}

/**
 * Enhanced performance monitor hook with memory tracking
 */
export function usePerformanceMonitor(componentName) {
  const renderCount = useRef(0)
  const renderTime = useRef(0)
  const memoryUsage = useRef(0)
  const [performanceData, setPerformanceData] = useState(null)

  useEffect(() => {
    const currentRenderCount = ++renderCount.current
    const startTime = performance.now()
    
    // Memory usage tracking (if available)
    if (performance.memory) {
      memoryUsage.current = performance.memory.usedJSHeapSize
    }
    
    return () => {
      const endTime = performance.now()
      renderTime.current = endTime - startTime
      
      const data = {
        renderCount: currentRenderCount,
        lastRenderTime: renderTime.current,
        memoryUsage: memoryUsage.current,
        timestamp: new Date().toISOString()
      }
      
      setPerformanceData(data)
      
      // Only log in development
      if (import.meta.env.DEV) {
        console.log(`🔍 ${componentName} render #${currentRenderCount}: ${renderTime.current.toFixed(2)}ms`, data)
      }
    }
  })

  return performanceData
}

/**
 * Enhanced local storage hook with compression and error handling
 */
export function useLocalStorage(key, defaultValue, options = {}) {
  const { ttl = null } = options
  
  const getValue = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return defaultValue
      
      const parsed = JSON.parse(item)
      
      // Check TTL
      if (ttl && parsed.timestamp) {
        const now = Date.now()
        if (now - parsed.timestamp > ttl * 1000) {
          window.localStorage.removeItem(key)
          return defaultValue
        }
      }
      
      return ttl ? parsed.value : parsed
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  }, [key, defaultValue, ttl])

  const setValue = useCallback((value) => {
    try {
      const dataToStore = ttl 
        ? { value, timestamp: Date.now() }
        : value
        
      window.localStorage.setItem(key, JSON.stringify(dataToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, ttl])

  return [getValue(), setValue]
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScrolling(items, itemHeight = 50, containerHeight = 400) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    }
  }, [items, itemHeight, containerHeight, scrollTop])
  
  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop)
  }, [])
  
  return {
    visibleItems,
    handleScroll,
    totalHeight: visibleItems.totalHeight
  }
}

/**
 * Image lazy loading hook
 */
export function useLazyImage(src, options = {}) {
  const [imageSrc, setImageSrc] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const imgRef = useRef()
  
  useEffect(() => {
    const currentImg = imgRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoading(true)
          const img = new Image()
          
          img.onload = () => {
            setImageSrc(src)
            setIsLoading(false)
          }
          
          img.onerror = () => {
            setError('Failed to load image')
            setIsLoading(false)
          }
          
          img.src = src
          if (currentImg) {
            observer.unobserve(currentImg)
          }
        }
      },
      { threshold: 0.1, ...options }
    )
    
    if (currentImg) {
      observer.observe(currentImg)
    }
    
    return () => {
      if (currentImg) {
        observer.unobserve(currentImg)
      }
    }
  }, [src, options])
  
  return { imageSrc, isLoading, error, imgRef }
}

/**
 * Network status hook for offline handling
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState(
    navigator.connection?.effectiveType || 'unknown'
  )
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    const handleConnectionChange = () => {
      setConnectionType(navigator.connection?.effectiveType || 'unknown')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleConnectionChange)
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])
  
  return { isOnline, connectionType }
}