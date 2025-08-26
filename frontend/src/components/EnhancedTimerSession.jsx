import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  tickTimer,
  advanceToNextPhase,
  selectCurrentTimer,
  selectActiveSessionSet
} from '../features/pomodoroSets/pomodoroSetsSlice'

/**
 * Enhanced Timer Session Component for Pomodoro Session Sets
 * Supports complete cycle management with automatic transitions
 */
export default function EnhancedTimerSession({
  sessionSet,
  habitName,
  onSessionComplete,
  onCycleComplete
}) {
  const dispatch = useDispatch()
  const currentTimer = useSelector(selectCurrentTimer)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showBreakOptions, setShowBreakOptions] = useState(false)
  const timerRef = useRef(null)

  // Start timer interval when timer is running
  useEffect(() => {
    if (currentTimer.isRunning && currentTimer.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        dispatch(tickTimer())
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [currentTimer.isRunning, currentTimer.timeLeft, dispatch])

  // Check for timer completion
  useEffect(() => {
    if (currentTimer.timeLeft === 0 && currentTimer.totalTime > 0 && !isCompleted) {
      setIsCompleted(true)
      setShowBreakOptions(currentTimer.sessionType === 'WORK')
      
      if (onSessionComplete) {
        onSessionComplete(currentTimer.sessionType)
      }
    } else if (currentTimer.timeLeft > 0) {
      setIsCompleted(false)
      setShowBreakOptions(false)
    }
  }, [currentTimer.timeLeft, currentTimer.totalTime, isCompleted, currentTimer.sessionType, onSessionComplete])

  const handleStartSession = () => {
    if (!sessionSet) return

    let sessionType, duration
    
    switch (sessionSet.currentPhase) {
      case 'WORK':
        sessionType = 'WORK'
        duration = sessionSet.workMinutes
        break
      case 'SHORT_BREAK':
        sessionType = 'SHORT_BREAK'
        duration = sessionSet.shortBreakMinutes
        break
      case 'LONG_BREAK':
        sessionType = 'LONG_BREAK'
        duration = sessionSet.longBreakMinutes
        break
      default:
        return
    }

    dispatch(startTimer({
      sessionSetId: sessionSet.id,
      timeMinutes: duration,
      sessionType,
      habitId: sessionSet.habitId,
      habitName
    }))
  }

  const handlePause = () => {
    dispatch(pauseTimer())
  }

  const handleResume = () => {
    dispatch(resumeTimer())
  }

  const handleStop = () => {
    dispatch(stopTimer())
    setIsCompleted(false)
    setShowBreakOptions(false)
  }

  const handleAdvanceToNext = async () => {
    try {
      const result = await dispatch(advanceToNextPhase(sessionSet.id)).unwrap()
      
      setIsCompleted(false)
      setShowBreakOptions(false)
      
      // Check if cycle is completed
      if (result.isCompleted && onCycleComplete) {
        onCycleComplete(result)
      } else if (sessionSet.autoAdvance) {
        // Auto-start next session
        setTimeout(() => handleStartSession(), 1000)
      }
    } catch (error) {
      console.error('Failed to advance to next phase:', error)
    }
  }

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Calculate progress percentage
  const progressPercentage = currentTimer.totalTime > 0 
    ? ((currentTimer.totalTime - currentTimer.timeLeft) / currentTimer.totalTime) * 100
    : 0

  // Get session type display info
  const getSessionInfo = () => {
    if (!sessionSet) return { icon: '🍅', title: 'Pomodoro', color: 'blue' }

    switch (sessionSet.currentPhase) {
      case 'WORK':
        return { 
          icon: '🍅', 
          title: `Focus Session ${sessionSet.currentSession}/${sessionSet.plannedSessions}`, 
          color: 'blue' 
        }
      case 'SHORT_BREAK':
        return { 
          icon: '☕', 
          title: 'Short Break', 
          color: 'green' 
        }
      case 'LONG_BREAK':
        return { 
          icon: '🧘', 
          title: 'Long Break', 
          color: 'purple' 
        }
      default:
        return { icon: '🍅', title: 'Pomodoro', color: 'blue' }
    }
  }

  const sessionInfo = getSessionInfo()

  if (!sessionSet) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center text-gray-400">
          No active session set. Plan a Pomodoro session to get started!
        </div>
      </div>
    )
  }

  if (sessionSet.isCompleted) {
    return (
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-lg p-6 border border-emerald-600">
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-emerald-100 mb-2">
            Cycle Completed!
          </h3>
          <p className="text-emerald-200 mb-4">
            Congratulations! You completed {sessionSet.completedSessions} Pomodoros
          </p>
          <div className="bg-emerald-800 rounded-lg p-3">
            <div className="text-emerald-100 text-sm">
              Total time: {Math.round(sessionSet.totalDurationMinutes / 60 * 10) / 10}h
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-lg p-6 border border-emerald-600">
        <div className="text-center">
          <div className="text-6xl mb-4">{sessionInfo.icon}</div>
          <h3 className="text-xl font-semibold text-emerald-100 mb-2">
            {currentTimer.sessionType === 'WORK' ? 'Work Session Complete!' : 'Break Complete!'}
          </h3>
          <p className="text-emerald-200 mb-4">
            Great job! Ready for the next phase?
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleAdvanceToNext}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              {sessionSet.needsLongBreak ? '🧘 Start Long Break' : 
               sessionSet.currentPhase === 'WORK' ? '☕ Start Short Break' : 
               '🍅 Start Next Pomodoro'}
            </button>
            
            <button
              onClick={handleStop}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Stop Session
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-${sessionInfo.color}-900 to-${sessionInfo.color}-800 rounded-lg p-6 border border-${sessionInfo.color}-600`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{sessionInfo.icon}</div>
        <h3 className={`text-lg font-semibold mb-1 text-${sessionInfo.color}-100`}>
          {sessionInfo.title}
        </h3>
        <p className={`text-sm text-${sessionInfo.color}-200`}>
          {habitName}
        </p>
      </div>

      {/* Progress Ring */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className={`text-${sessionInfo.color}-800 opacity-30`}
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={`text-${sessionInfo.color}-300`}
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-center text-${sessionInfo.color}-100`}>
              <div className="text-2xl font-mono font-bold">
                {formatTime(currentTimer.timeLeft)}
              </div>
              <div className="text-xs opacity-75">
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className={`text-${sessionInfo.color}-200`}>Session Progress</span>
          <span className={`text-${sessionInfo.color}-200`}>
            {sessionSet.completedSessions}/{sessionSet.plannedSessions} complete
          </span>
        </div>
        <div className={`w-full bg-${sessionInfo.color}-800 rounded-full h-2`}>
          <div
            className={`bg-${sessionInfo.color}-400 h-2 rounded-full transition-all duration-300`}
            style={{ width: `${(sessionSet.completedSessions / sessionSet.plannedSessions) * 100}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {currentTimer.timeLeft === 0 ? (
          <button
            onClick={handleStartSession}
            className={`w-full bg-${sessionInfo.color}-600 hover:bg-${sessionInfo.color}-700 text-white py-3 px-4 rounded-lg transition-colors font-medium`}
          >
            ▶ Start {sessionInfo.title}
          </button>
        ) : currentTimer.isRunning ? (
          <button
            onClick={handlePause}
            className={`w-full bg-${sessionInfo.color}-600 hover:bg-${sessionInfo.color}-700 text-white py-3 px-4 rounded-lg transition-colors font-medium`}
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            onClick={handleResume}
            className={`w-full bg-${sessionInfo.color}-600 hover:bg-${sessionInfo.color}-700 text-white py-3 px-4 rounded-lg transition-colors font-medium`}
          >
            ▶ Resume
          </button>
        )}
        
        {currentTimer.timeLeft > 0 && (
          <button
            onClick={handleStop}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
          >
            ⏹ Stop
          </button>
        )}
      </div>

      {/* Next Session Preview */}
      {sessionSet.currentPhase === 'WORK' && !isCompleted && (
        <div className={`mt-4 text-center text-${sessionInfo.color}-300 text-sm`}>
          Next: {sessionSet.needsLongBreak ? `Long Break (${sessionSet.longBreakMinutes}min)` : `Short Break (${sessionSet.shortBreakMinutes}min)`}
        </div>
      )}
    </div>
  )
}