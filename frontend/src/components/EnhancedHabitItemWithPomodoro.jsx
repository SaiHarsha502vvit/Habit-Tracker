import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showSessionPlanning, fetchActiveSessionSet, selectActiveSessionSet } from '../features/pomodoroSets/pomodoroSetsSlice'
import { selectLogsForHabit } from '../features/habits/habitsSlice'
import EnhancedTimerSession from './EnhancedTimerSession'
import SessionPlanningModal from './SessionPlanningModal'
import CompletionCelebrationModal from './CompletionCelebrationModal'

/**
 * Enhanced Habit Item with Pomodoro Session Set Integration
 */
export default function EnhancedHabitItemWithPomodoro({ habit, onToggle }) {
  const dispatch = useDispatch()
  const activeSessionSet = useSelector(state => selectActiveSessionSet(state, habit.id))
  const logsData = useSelector(state => selectLogsForHabit(state, habit.id))
  const [showPlanning, setShowPlanning] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [completedSessionSet, setCompletedSessionSet] = useState(null)

  // Fetch active session set on mount
  useEffect(() => {
    if (habit.habitType === 'TIMED') {
      dispatch(fetchActiveSessionSet(habit.id))
    }
  }, [dispatch, habit.id, habit.habitType])

  const today = new Date().toISOString().split('T')[0]
  const isCompletedToday = logsData.completions?.includes(today) || false

  const handleStartPomodoro = () => {
    if (activeSessionSet) {
      // There's already an active session set, can start timer directly
      return
    } else {
      // Need to plan a new session set
      dispatch(showSessionPlanning({ habitId: habit.id }))
      setShowPlanning(true)
    }
  }

  const handleSessionComplete = (sessionType) => {
    console.log(`Session completed: ${sessionType}`)
    // Could add notifications or other side effects here
  }

  const handleCycleComplete = (sessionSet) => {
    console.log('Pomodoro cycle completed!', sessionSet)
    setCompletedSessionSet(sessionSet)
    setShowCelebration(true)
    
    // Log habit completion when cycle is done
    if (onToggle && !isCompletedToday) {
      onToggle(habit.id)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '🔥'
      case 'medium': return '⚡'
      case 'low': return '🌱'
      default: return '📝'
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getPriorityIcon(habit.priority)}</span>
              <div>
                <h3 className="text-lg font-semibold text-white">{habit.name}</h3>
                {habit.description && (
                  <p className="text-gray-300 text-sm mt-1">{habit.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-3">
              {/* Priority */}
              <div className="flex items-center space-x-1">
                <span className={`text-xs font-medium ${getPriorityColor(habit.priority)}`}>
                  {habit.priority || 'Medium'} Priority
                </span>
              </div>

              {/* Category */}
              {habit.category && (
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400 text-xs">•</span>
                  <span className="text-gray-400 text-xs">{habit.category.name}</span>
                </div>
              )}

              {/* Tags */}
              {habit.tags && habit.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs">•</span>
                  <div className="flex space-x-1">
                    {habit.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    {habit.tags.length > 3 && (
                      <span className="text-gray-400 text-xs">+{habit.tags.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Completion Status */}
          <div className="flex items-center space-x-2">
            {isCompletedToday && (
              <div className="flex items-center space-x-1 text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Complete</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {habit.habitType === 'TIMED' ? (
          // Pomodoro/Timer Interface
          <div className="space-y-4">
            {activeSessionSet ? (
              <EnhancedTimerSession
                sessionSet={activeSessionSet}
                habitName={habit.name}
                onSessionComplete={handleSessionComplete}
                onCycleComplete={handleCycleComplete}
              />
            ) : (
              // No active session - show start button
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🍅</div>
                <h4 className="text-lg font-medium text-white mb-2">
                  Ready for a Pomodoro session?
                </h4>
                <p className="text-gray-400 text-sm mb-6">
                  Plan your focus sessions and take strategic breaks
                </p>
                <button
                  onClick={handleStartPomodoro}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                >
                  🍅 Plan Pomodoro Session
                </button>
              </div>
            )}
          </div>
        ) : (
          // Standard habit interface
          <div className="text-center py-6">
            <button
              onClick={() => onToggle(habit.id)}
              disabled={isCompletedToday}
              className={`py-3 px-6 rounded-lg font-medium transition-colors ${
                isCompletedToday
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isCompletedToday ? '✅ Completed Today' : '✓ Mark Complete'}
            </button>
          </div>
        )}

        {/* Session Set Statistics */}
        {habit.habitType === 'TIMED' && activeSessionSet && (
          <div className="mt-4 bg-gray-700 rounded-lg p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Session Set Progress</span>
              <span className="text-white font-medium">
                {activeSessionSet.completedSessions}/{activeSessionSet.plannedSessions}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div
                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(activeSessionSet.completedSessions / activeSessionSet.plannedSessions) * 100}%` 
                }}
              />
            </div>
            {activeSessionSet.progressPercentage > 0 && (
              <div className="text-center mt-2">
                <span className="text-xs text-gray-400">
                  {activeSessionSet.progressPercentage}% complete
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <SessionPlanningModal
        isOpen={showPlanning}
        onClose={() => setShowPlanning(false)}
        habitId={habit.id}
        habitName={habit.name}
      />

      <CompletionCelebrationModal
        isOpen={showCelebration}
        sessionSet={completedSessionSet}
        habitName={habit.name}
        onClose={() => setShowCelebration(false)}
      />
    </div>
  )
}