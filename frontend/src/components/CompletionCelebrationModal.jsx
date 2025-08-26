import { useDispatch } from 'react-redux'
import { hideCompletionCelebration } from '../features/pomodoroSets/pomodoroSetsSlice'

/**
 * Completion Celebration Modal
 * Shows when a complete Pomodoro session set is finished
 */
export default function CompletionCelebrationModal({ 
  isOpen, 
  sessionSet, 
  habitName,
  onClose 
}) {
  const dispatch = useDispatch()

  if (!isOpen || !sessionSet) return null

  const handleClose = () => {
    dispatch(hideCompletionCelebration())
    if (onClose) onClose()
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const startTime = new Date(sessionSet.startTime)
  const endTime = new Date(sessionSet.endTime)
  const actualDuration = Math.round((endTime - startTime) / (1000 * 60)) // minutes

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-lg p-8 w-full max-w-md border-2 border-emerald-400">
        {/* Celebration Animation */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-2xl font-bold text-emerald-100 mb-2">
            Pomodoro Cycle Complete!
          </h2>
          <p className="text-emerald-200 text-lg">
            Amazing work on <span className="font-semibold">{habitName}</span>!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-emerald-100 mb-1">
              {sessionSet.completedSessions}
            </div>
            <div className="text-emerald-300 text-sm">
              Pomodoros Completed
            </div>
          </div>

          <div className="bg-emerald-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-emerald-100 mb-1">
              {formatTime(actualDuration)}
            </div>
            <div className="text-emerald-300 text-sm">
              Total Time Spent
            </div>
          </div>

          <div className="bg-emerald-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-emerald-100 mb-1">
              {formatTime(sessionSet.completedSessions * sessionSet.workMinutes)}
            </div>
            <div className="text-emerald-300 text-sm">
              Pure Focus Time
            </div>
          </div>

          <div className="bg-emerald-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-emerald-100 mb-1">
              100%
            </div>
            <div className="text-emerald-300 text-sm">
              Completion Rate
            </div>
          </div>
        </div>

        {/* Achievement Message */}
        <div className="bg-emerald-700 rounded-lg p-4 mb-6 text-center">
          <div className="text-emerald-100 font-medium mb-2">
            🏆 Achievement Unlocked
          </div>
          <div className="text-emerald-200 text-sm">
            {sessionSet.completedSessions >= 8 ? 'Pomodoro Master - 8+ sessions!' :
             sessionSet.completedSessions >= 6 ? 'Focus Champion - 6+ sessions!' :
             sessionSet.completedSessions >= 4 ? 'Productivity Hero - Complete cycle!' :
             'Great Start - Keep building the habit!'}
          </div>
        </div>

        {/* Session Timeline */}
        <div className="mb-6">
          <h4 className="text-emerald-200 text-sm font-medium mb-3">Session Timeline</h4>
          <div className="space-y-2">
            {Array.from({ length: sessionSet.completedSessions }, (_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <div className="text-emerald-200 text-sm">
                  Pomodoro {i + 1} - {sessionSet.workMinutes} minutes
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-emerald-700 rounded-lg p-4 mb-6 text-center">
          <div className="text-emerald-100 text-sm italic">
            "Success is the sum of small efforts, repeated day in and day out."
          </div>
          <div className="text-emerald-300 text-xs mt-1">
            - Robert Collier
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
          >
            Continue Building Habits
          </button>
          
          <button
            onClick={() => {
              // Could trigger starting a new session set
              handleClose()
            }}
            className="w-full bg-emerald-700 hover:bg-emerald-600 text-emerald-100 py-2 px-4 rounded-lg transition-colors border border-emerald-500"
          >
            Start Another Session Set
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-emerald-300 hover:text-emerald-100 p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Decorative Elements */}
        <div className="absolute -top-2 -left-2 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>
          🎊
        </div>
        <div className="absolute -top-2 -right-2 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>
          ✨
        </div>
        <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce" style={{ animationDelay: '1.5s' }}>
          🌟
        </div>
        <div className="absolute -bottom-2 -right-2 text-2xl animate-bounce" style={{ animationDelay: '0.7s' }}>
          🎈
        </div>
      </div>
    </div>
  )
}