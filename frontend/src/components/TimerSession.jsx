import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppDispatch } from '../app/hooks'
import { logHabit } from '../features/habits/habitsSlice'
import toast from 'react-hot-toast'

/**
 * Timer Session Component
 * Displays an active Pomodoro session with controls
 */
export default function TimerSession({
  session,
  onPause,
  onResume,
  onStop,
  onComplete,
}) {
  const dispatch = useAppDispatch()
  const [isCompleting, setIsCompleting] = useState(false)
  // Use ref to track current completion state for better stability
  const completionProcessedRef = useRef(false)

  const {
    habitId,
    habitName,
    remainingSeconds,
    totalSeconds,
    isRunning,
    isPaused,
    isCompleted,
  } = session

  // Debug logging for session state changes (reduced frequency)
  useEffect(() => {
    if (isCompleted || remainingSeconds % 10 === 0 || remainingSeconds <= 5) {
      console.log('🔍 TimerSession Debug:', {
        habitId,
        habitName,
        remainingSeconds,
        isRunning,
        isPaused,
        isCompleted,
        isCompleting,
        timestamp: new Date().toISOString(),
      })
    }
  }, [
    habitId,
    habitName,
    remainingSeconds,
    isRunning,
    isPaused,
    isCompleted,
    isCompleting,
  ])

  // Format time display
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`

  // Calculate progress percentage
  const progressPercentage =
    ((totalSeconds - remainingSeconds) / totalSeconds) * 100

  // Track if completion has already been processed to prevent multiple triggers
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false)

  // Reset completion tracking when session changes or restarts
  useEffect(() => {
    if (!isCompleted && remainingSeconds > 0) {
      setHasCompletedOnce(false)
      completionProcessedRef.current = false
    }
  }, [isCompleted, remainingSeconds])

  // Memoized completion handler to prevent infinite loops
  const handleAutoComplete = useCallback(async () => {
    if (completionProcessedRef.current) {
      console.log('⚠️ Completion already processed, skipping...')
      return
    }

    console.log('🎯 Timer completed! Starting auto-completion...', {
      habitId,
      habitName,
    })

    completionProcessedRef.current = true
    setIsCompleting(true)
    setHasCompletedOnce(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      console.log('📅 Logging habit for date:', today)

      const result = await dispatch(logHabit({ habitId, date: today })).unwrap()
      console.log('✅ Habit logged successfully:', result)

      toast.success(`🎉 ${habitName} completed! Great focus session!`, {
        duration: 6000,
        icon: '🏆',
      })

      // Call onComplete if provided (access from closure)
      onComplete?.(session)
    } catch (error) {
      console.error('❌ Failed to log habit:', error)
      toast.error(`Session completed but failed to log: ${error}`)
    } finally {
      setIsCompleting(false)
    }
  }, [dispatch, habitId, habitName, onComplete, session])

  // Handle automatic completion when timer reaches zero
  useEffect(() => {
    if (
      isCompleted &&
      !isCompleting &&
      !hasCompletedOnce &&
      !completionProcessedRef.current
    ) {
      console.log('⏰ Timer reached completion, auto-logging habit...')
      handleAutoComplete()
    }
  }, [isCompleted, isCompleting, hasCompletedOnce, handleAutoComplete])

  const handlePauseResume = () => {
    if (isPaused) {
      onResume()
    } else {
      onPause()
    }
  }

  if (isCompleted) {
    return (
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-lg p-6 border border-emerald-600">
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-emerald-100 mb-2">
            Session Complete!
          </h3>
          <p className="text-emerald-200 mb-4">
            {habitName} - Well done on your focused session!
          </p>
          {isCompleting ? (
            <div className="flex items-center justify-center space-x-2 text-emerald-200">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Logging completion...</span>
            </div>
          ) : (
            <button
              onClick={onStop}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Close Session
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-lg p-6 border border-blue-600">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-blue-100 mb-1">
          Focus Session
        </h3>
        <p className="text-blue-200 text-sm">{habitName}</p>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className="text-6xl font-mono font-bold text-white mb-2">
          {timeDisplay}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-blue-800 rounded-full h-2 mb-2">
          <div
            className="bg-blue-400 h-2 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <p className="text-blue-300 text-sm">
          {Math.floor(progressPercentage)}% complete
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handlePauseResume}
          disabled={!isRunning}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900 ${
            isRunning
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
        >
          {isPaused ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Resume</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Pause</span>
            </>
          )}
        </button>

        <button
          onClick={onStop}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-blue-900"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
              clipRule="evenodd"
            />
          </svg>
          <span>Stop</span>
        </button>
      </div>

      {/* Status Messages */}
      {isPaused && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-yellow-900 bg-opacity-50 text-yellow-200 px-3 py-1 rounded-lg text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Session Paused</span>
          </div>
        </div>
      )}
    </div>
  )
}
