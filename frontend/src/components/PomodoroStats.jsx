import { useState, useEffect } from 'react'
import { getPomodoroSessions, getPomodoroSessionsForDate } from '../services/api'

/**
 * Component showing Pomodoro session statistics for a habit
 */
export default function PomodoroStats({ habitId }) {
  const [sessions, setSessions] = useState([])
  const [todaySessions, setTodaySessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadSessions = async () => {
      if (!habitId) return

      try {
        setLoading(true)
        setError(null)

        // Load all sessions and today's sessions
        const [allSessions, todaySessionsData] = await Promise.all([
          getPomodoroSessions(habitId),
          getPomodoroSessionsForDate(habitId, new Date().toISOString().split('T')[0])
        ])

        setSessions(allSessions || [])
        setTodaySessions(todaySessionsData || [])
      } catch (error) {
        console.error('Failed to load Pomodoro sessions:', error)
        setError('Failed to load session data')
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [habitId])

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-600 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-red-600">
        <div className="text-red-400 text-sm">⚠️ {error}</div>
      </div>
    )
  }

  // Calculate statistics
  const workSessions = sessions.filter(s => s.sessionType === 'WORK')
  const shortBreaks = sessions.filter(s => s.sessionType === 'SHORT_BREAK')
  const longBreaks = sessions.filter(s => s.sessionType === 'LONG_BREAK')

  const todayWork = todaySessions.filter(s => s.sessionType === 'WORK')

  const totalWorkMinutes = workSessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const totalBreakMinutes = [...shortBreaks, ...longBreaks].reduce((sum, s) => sum + s.durationMinutes, 0)

  const todayWorkMinutes = todayWork.reduce((sum, s) => sum + s.durationMinutes, 0)

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100 flex items-center">
          <span className="mr-2">🍅</span>
          Pomodoro Stats
        </h3>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400">{todayWork.length}</div>
          <div className="text-sm text-gray-400">Sessions Today</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">
            {Math.round(todayWorkMinutes / 60 * 10) / 10}h
          </div>
          <div className="text-sm text-gray-400">Focus Time Today</div>
        </div>
      </div>

      {/* All-Time Stats */}
      <div className="border-t border-gray-600 pt-4">
        <h4 className="text-md font-medium text-gray-200 mb-3">All-Time Statistics</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-700 rounded p-3">
            <div className="text-2xl font-bold text-red-400">{workSessions.length}</div>
            <div className="text-sm text-gray-400">Total Sessions</div>
          </div>
          <div className="bg-gray-700 rounded p-3">
            <div className="text-2xl font-bold text-yellow-400">
              {Math.round(totalWorkMinutes / 60 * 10) / 10}h
            </div>
            <div className="text-sm text-gray-400">Total Focus Time</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <div className="text-blue-400 font-semibold">{shortBreaks.length}</div>
            <div className="text-gray-400">Short Breaks</div>
          </div>
          <div>
            <div className="text-purple-400 font-semibold">{longBreaks.length}</div>
            <div className="text-gray-400">Long Breaks</div>
          </div>
          <div>
            <div className="text-green-400 font-semibold">
              {Math.round(totalBreakMinutes / 60 * 10) / 10}h
            </div>
            <div className="text-gray-400">Break Time</div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="border-t border-gray-600 pt-4 mt-4">
          <h4 className="text-md font-medium text-gray-200 mb-3">Recent Sessions</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {sessions.slice(0, 5).map((session, index) => {
              const date = new Date(session.completedAt).toLocaleDateString()
              const time = new Date(session.completedAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
              const typeEmoji = {
                'WORK': '🍅',
                'SHORT_BREAK': '☕',
                'LONG_BREAK': '🧘'
              }[session.sessionType]

              return (
                <div key={index} className="flex justify-between items-center text-sm bg-gray-700 rounded px-2 py-1">
                  <span className="flex items-center">
                    {typeEmoji}
                    <span className="ml-2 text-gray-300">{session.durationMinutes}min</span>
                  </span>
                  <span className="text-gray-400">{date} {time}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}