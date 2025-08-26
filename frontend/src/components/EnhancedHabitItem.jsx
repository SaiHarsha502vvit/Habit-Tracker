import { useState, useEffect } from 'react'
import { useTimerSession } from '../hooks/useTimerSession'
import TimerSession from '../components/TimerSession'
import PomodoroStats from '../components/PomodoroStats'
import toast from 'react-hot-toast'

/**
 * Enhanced Habit Item Component with integrated Pomodoro functionality
 * Example showing how to use all the new features together
 */
export default function EnhancedHabitItem({ habit, onUpdate }) {
  const { 
    sessions, 
    startSession, 
    startBreakSession, 
    pauseSession, 
    resumeSession, 
    stopSession,
    getSessionCount
  } = useTimerSession()
  
  const [activeSession, setActiveSession] = useState(null)
  const [showStats, setShowStats] = useState(false)

  // Find active session for this habit
  useEffect(() => {
    const habitSessions = Object.values(sessions).filter(
      session => session.habitId === habit.id
    )
    
    const active = habitSessions.find(
      session => session.isRunning && !session.isCompleted
    )
    
    setActiveSession(active || null)
  }, [sessions, habit.id])

  const handleStartTimer = () => {
    if (habit.habitType === 'TIMED' && habit.timerDurationMinutes) {
      startSession(
        habit.id,
        habit.timerDurationMinutes,
        habit.name
      )
      
      toast.success(`🍅 Started ${habit.timerDurationMinutes}-minute focus session for "${habit.name}"`)
    }
  }

  const handleStartBreak = (habitId, durationMinutes, habitName, breakType) => {
    startBreakSession(habitId, durationMinutes, habitName, breakType)
    toast.success(`${breakType === 'short' ? '☕' : '🧘'} Started ${durationMinutes}-minute break`)
  }

  const handleStopSession = () => {
    if (activeSession) {
      stopSession(activeSession.id)
      toast.success('⏹️ Session stopped')
    }
  }

  const handleSessionComplete = (session) => {
    console.log('🎉 Session completed:', session)
    // Could trigger additional actions here
  }

  const getTodaySessionCount = () => {
    return getSessionCount(habit.id)
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-4">
      {/* Habit Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-100">{habit.name}</h3>
          {habit.description && (
            <p className="text-gray-400 text-sm mt-1">{habit.description}</p>
          )}
          <div className="flex items-center space-x-3 mt-2 text-xs">
            <span className={`px-2 py-1 rounded ${
              habit.habitType === 'TIMED' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {habit.habitType === 'TIMED' ? `🍅 ${habit.timerDurationMinutes}min` : '✓ Standard'}
            </span>
            <span className="text-gray-500">Today: {getTodaySessionCount()} sessions</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {habit.habitType === 'TIMED' && !activeSession && (
            <button
              onClick={handleStartTimer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <span>🍅</span>
              <span>Start Focus</span>
            </button>
          )}
          
          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            📊
          </button>
        </div>
      </div>

      {/* Active Timer Session */}
      {activeSession && (
        <div className="border-t border-gray-600 pt-4">
          <TimerSession
            session={activeSession}
            onPause={() => pauseSession(activeSession.id)}
            onResume={() => resumeSession(activeSession.id)}
            onStop={handleStopSession}
            onComplete={handleSessionComplete}
            onStartBreak={handleStartBreak}
          />
        </div>
      )}

      {/* Statistics Panel */}
      {showStats && (
        <div className="border-t border-gray-600 pt-4">
          <PomodoroStats habitId={habit.id} />
        </div>
      )}

      {/* Quick Actions */}
      {!activeSession && (
        <div className="border-t border-gray-600 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>No active session</span>
            <div className="flex space-x-2">
              {habit.habitType === 'STANDARD' && (
                <button
                  onClick={() => onUpdate?.(habit.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                >
                  ✓ Mark Done
                </button>
              )}
              
              <button
                onClick={() => setShowStats(!showStats)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors"
              >
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}