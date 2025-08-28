import { useCallback, useRef } from 'react'

/**
 * Custom hook for debouncing function calls
 * Uses best practices from React documentation and proven libraries like lodash
 * 
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies array for useCallback
 * @returns {Function} - Debounced function
 */
export const useDebounce = (callback, delay, deps = []) => {
  const timeoutRef = useRef(null)

  return useCallback(
    (...args) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay, ...deps]
  )
}

/**
 * Custom hook for debouncing async function calls with loading states
 * Implements the Command pattern for better control over async operations
 * 
 * @param {Function} asyncCallback - The async function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies array
 * @returns {Object} - { debouncedFn, isLoading, cancel }
 */
export const useAsyncDebounce = (asyncCallback, delay, deps = []) => {
  const timeoutRef = useRef(null)
  const isLoadingRef = useRef(false)

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    isLoadingRef.current = false
  }, [])

  const debouncedFn = useCallback(
    async (...args) => {
      cancel()
      
      timeoutRef.current = setTimeout(async () => {
        try {
          isLoadingRef.current = true
          await asyncCallback(...args)
        } catch (error) {
          console.error('Debounced async operation failed:', error)
          throw error
        } finally {
          isLoadingRef.current = false
          timeoutRef.current = null
        }
      }, delay)
    },
    [asyncCallback, delay, cancel, ...deps]
  )

  return {
    debouncedFn,
    isLoading: isLoadingRef.current,
    cancel
  }
}

export default useDebounce
