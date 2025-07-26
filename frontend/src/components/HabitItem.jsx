import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  selectHabitById,
  removeHabit,
  logHabit,
  selectLogsForHabit,
} from '../features/habits/habitsSlice'
import { useTimerSession } from '../hooks/useTimerSession'
import ContributionGraph from './ContributionGraph'
import TimerSession from './TimerSession'
import toast from 'react-hot-toast'

/**
 * Individual habit item component
 */
function HabitItem({ habitId }) {
  const dispatch = useAppDispatch()
  const habit = useAppSelector(state => selectHabitById(state, habitId))

  // Get logs data for this habit
  const logsData = useAppSelector(state => selectLogsForHabit(state, habitId))

  // Timer session management
  const {
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    getActiveSession,
  } = useTimerSession()
  const activeSession = getActiveSession(habitId)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isLogging, setIsLogging] = useState(false)

  if (!habit) {
    return null
  }

  const today = new Date().toISOString().split('T')[0]
  const isCompletedToday = logsData.completions.includes(today)
  const currentYear = new Date().getFullYear()
  const isTimedHabit = habit.habitType === 'TIMED'

  const handleCompleteToday = async () => {
    if (isCompletedToday || isLogging) return

    setIsLogging(true)

    try {
      await dispatch(logHabit({ habitId, date: today })).unwrap()
      toast.success('Great job! Habit completed for today! 🎉')
    } catch (error) {
      toast.error(error || 'Failed to log habit. Please try again.')
    } finally {
      setIsLogging(false)
    }
  }

  const handleStartFocusSession = () => {
    if (isCompletedToday) {
      toast.success('Already completed today! 🎉')
      return
    }

    if (activeSession) {
      toast('Session already running!', { icon: '⏰' })
      return
    }

    const sessionId = startSession(
      habitId,
      habit.timerDurationMinutes,
      habit.name
    )
    toast.success(`Focus session started! 🎯`, {
      icon: '⏱️',
      duration: 3000,
    })

    return sessionId
  }

  const handlePauseSession = () => {
    if (activeSession) {
      pauseSession(activeSession.id)
      toast('Session paused', { icon: '⏸️' })
    }
  }

  const handleResumeSession = () => {
    if (activeSession) {
      resumeSession(activeSession.id)
      toast('Session resumed!', { icon: '▶️' })
    }
  }

  const handleStopSession = () => {
    if (activeSession) {
      stopSession(activeSession.id)
      toast('Session stopped', { icon: '⏹️' })
    }
  }

  const handleSessionComplete = () => {
    // This will be called automatically when the timer completes
    // The TimerSession component handles the logging
    setTimeout(() => {
      if (activeSession) {
        stopSession(activeSession.id)
      }
    }, 3000) // Give time for user to see completion message
  }

  const handleDelete = async () => {
    try {
      // Stop any active session before deleting
      if (activeSession) {
        stopSession(activeSession.id)
      }

      await dispatch(removeHabit(habitId)).unwrap()
      toast.success('Habit deleted successfully')
      setShowDeleteModal(false)
    } catch (error) {
      toast.error(error || 'Failed to delete habit. Please try again.')
    }
  }

  // If there's an active session, show the timer interface
  if (activeSession) {
    return (
      <article className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700">
        <TimerSession
          session={activeSession}
          onPause={handlePauseSession}
          onResume={handleResumeSession}
          onStop={handleStopSession}
          onComplete={handleSessionComplete}
        />
      </article>
    )
  }

  return (
    <article className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-100">
              {habit.name}
            </h3>
            {isTimedHabit && (
              <div className="flex items-center space-x-1 bg-blue-900 bg-opacity-50 text-blue-300 px-2 py-1 rounded text-xs">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{habit.timerDurationMinutes}min</span>
              </div>
            )}
          </div>
          {habit.description && (
            <p className="text-sm text-gray-400 line-clamp-2">
              {habit.description}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Created:{' '}
            {new Date(habit.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          aria-label="Delete habit"
          className="ml-4 p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Action Button - Different for Standard vs Timed habits */}
      <div className="flex justify-center">
        {isTimedHabit ? (
          <button
            onClick={handleStartFocusSession}
            disabled={isCompletedToday}
            className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              isCompletedToday
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
            }`}
          >
            {isCompletedToday ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Completed Today! 🎉</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Start Focus Session</span>
                <span className="text-blue-200">
                  ({habit.timerDurationMinutes}min)
                </span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleCompleteToday}
            disabled={isCompletedToday || isLogging}
            className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              isCompletedToday
                ? 'bg-emerald-600 border-emerald-600 text-white cursor-default'
                : isLogging
                ? 'border-emerald-600 text-emerald-600 animate-pulse cursor-not-allowed'
                : 'border-gray-500 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 hover:scale-105'
            }`}
          >
            {isCompletedToday ? (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : isLogging ? (
              <svg
                className="w-6 h-6 animate-spin"
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
            ) : (
              <span className="text-2xl font-light">+</span>
            )}
          </button>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-300">
          {isCompletedToday
            ? 'Completed for today! 🎉'
            : isTimedHabit
            ? 'Start your focus session'
            : 'Complete for Today'}
        </p>
      </div>

      {/* Contribution Graph */}
      <ContributionGraph habitId={habitId} year={currentYear} />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <h3
              id="delete-modal-title"
              className="text-lg font-semibold text-gray-100 mb-3"
            >
              Are you sure?
            </h3>
            <p className="text-sm text-gray-300 mb-6">
              This will permanently delete the &apos;{habit.name}&apos; habit
              and all of its logged progress. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export default HabitItem
