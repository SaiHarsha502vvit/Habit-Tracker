import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createSessionSet, hideSessionPlanning } from '../features/pomodoroSets/pomodoroSetsSlice'

/**
 * Session Planning Modal Component
 * Allows users to plan a complete Pomodoro cycle with custom settings
 */
export default function SessionPlanningModal({ 
  isOpen, 
  onClose, 
  habitId, 
  habitName 
}) {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    plannedSessions: 4,
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    autoAdvance: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateTotalTime = () => {
    const { plannedSessions, workMinutes, shortBreakMinutes, longBreakMinutes, sessionsBeforeLongBreak } = formData
    
    const totalWorkTime = plannedSessions * workMinutes
    const shortBreaksCount = Math.max(0, plannedSessions - 1)
    const longBreaksCount = Math.max(0, Math.floor((plannedSessions - 1) / sessionsBeforeLongBreak))
    const totalBreakTime = (shortBreaksCount * shortBreakMinutes) + (longBreaksCount * longBreakMinutes)
    
    return totalWorkTime + totalBreakTime
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const sessionSetData = {
        habitId,
        ...formData
      }
      
      await dispatch(createSessionSet(sessionSetData)).unwrap()
      dispatch(hideSessionPlanning())
      onClose()
    } catch (error) {
      console.error('Failed to create session set:', error)
      // Error is handled in the slice
    } finally {
      setIsSubmitting(false)
    }
  }

  const presets = [
    {
      name: '🍅 Classic Pomodoro',
      description: '4 sessions of 25min with 5min breaks',
      settings: {
        plannedSessions: 4,
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        sessionsBeforeLongBreak: 4
      }
    },
    {
      name: '🧠 Deep Work',
      description: '3 sessions of 90min with 20min breaks',
      settings: {
        plannedSessions: 3,
        workMinutes: 90,
        shortBreakMinutes: 20,
        longBreakMinutes: 30,
        sessionsBeforeLongBreak: 3
      }
    },
    {
      name: '⚡ Sprint Sessions',
      description: '6 sessions of 15min with 3min breaks',
      settings: {
        plannedSessions: 6,
        workMinutes: 15,
        shortBreakMinutes: 3,
        longBreakMinutes: 10,
        sessionsBeforeLongBreak: 3
      }
    }
  ]

  const applyPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      ...preset.settings
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">🍅 Plan Pomodoro Session</h2>
            <p className="text-gray-300 text-sm mt-1">for {habitName}</p>
          </div>
          <button
            onClick={() => {
              dispatch(hideSessionPlanning())
              onClose()
            }}
            className="text-gray-400 hover:text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Presets */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-200 mb-3">Quick Presets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-left transition-colors border border-gray-600"
                >
                  <div className="font-medium text-white text-sm">{preset.name}</div>
                  <div className="text-gray-300 text-xs mt-1">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Number of Pomodoros
              </label>
              <select
                value={formData.plannedSessions}
                onChange={(e) => handleInputChange('plannedSessions', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num} Pomodoro{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Work Session (minutes)
              </label>
              <select
                value={formData.workMinutes}
                onChange={(e) => handleInputChange('workMinutes', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[15, 20, 25, 30, 45, 50, 60, 90].map(minutes => (
                  <option key={minutes} value={minutes}>{minutes} min</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Short Break (minutes)
              </label>
              <select
                value={formData.shortBreakMinutes}
                onChange={(e) => handleInputChange('shortBreakMinutes', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[3, 5, 10, 15].map(minutes => (
                  <option key={minutes} value={minutes}>{minutes} min</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Long Break (minutes)
              </label>
              <select
                value={formData.longBreakMinutes}
                onChange={(e) => handleInputChange('longBreakMinutes', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[10, 15, 20, 25, 30].map(minutes => (
                  <option key={minutes} value={minutes}>{minutes} min</option>
                ))}
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="mb-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.autoAdvance}
                onChange={(e) => handleInputChange('autoAdvance', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-200 text-sm">
                Auto-advance to next session (recommended)
              </span>
            </label>
          </div>

          {/* Summary */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
            <h4 className="font-medium text-white mb-2">Session Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-300">Total Sessions:</div>
                <div className="text-white font-medium">{formData.plannedSessions} Pomodoros</div>
              </div>
              <div>
                <div className="text-gray-300">Estimated Time:</div>
                <div className="text-white font-medium">{formatTime(calculateTotalTime())}</div>
              </div>
              <div>
                <div className="text-gray-300">Work Time:</div>
                <div className="text-white font-medium">{formatTime(formData.plannedSessions * formData.workMinutes)}</div>
              </div>
              <div>
                <div className="text-gray-300">Break Time:</div>
                <div className="text-white font-medium">
                  {formatTime(calculateTotalTime() - (formData.plannedSessions * formData.workMinutes))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                dispatch(hideSessionPlanning())
                onClose()
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Start Session Set'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}