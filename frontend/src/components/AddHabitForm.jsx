import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { addNewHabit, selectHabitsStatus } from '../features/habits/habitsSlice'
import toast from 'react-hot-toast'

/**
 * Form component for adding new habits
 */
function AddHabitForm() {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectHabitsStatus)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    habitType: 'STANDARD',
    timerDurationMinutes: 25, // Default Pomodoro duration
  })

  const isLoading = status === 'loading'
  const isFormValid =
    formData.name.trim().length >= 3 &&
    (formData.habitType === 'STANDARD' ||
      (formData.habitType === 'TIMED' &&
        formData.timerDurationMinutes >= 1 &&
        formData.timerDurationMinutes <= 480))

  const handleChange = e => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!isFormValid) {
      if (formData.name.trim().length < 3) {
        toast.error('Habit name must be at least 3 characters long')
      } else if (
        formData.habitType === 'TIMED' &&
        (formData.timerDurationMinutes < 1 ||
          formData.timerDurationMinutes > 480)
      ) {
        toast.error('Timer duration must be between 1 and 480 minutes')
      }
      return
    }

    try {
      const habitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        habitType: formData.habitType,
      }

      // Only include timer duration for timed habits
      if (formData.habitType === 'TIMED') {
        habitData.timerDurationMinutes = formData.timerDurationMinutes
      }

      await dispatch(addNewHabit(habitData)).unwrap()

      // Clear form on success
      setFormData({
        name: '',
        description: '',
        habitType: 'STANDARD',
        timerDurationMinutes: 25,
      })

      // Show success message
      const habitTypeText =
        formData.habitType === 'TIMED'
          ? `timed habit (${formData.timerDurationMinutes}min)`
          : 'habit'
      toast.success(
        `${habitTypeText.charAt(0).toUpperCase() + habitTypeText.slice(1)} '${
          formData.name
        }' created! ✅`
      )

      // Return focus to name input for rapid addition
      document.getElementById('habit-name-input')?.focus()
    } catch (error) {
      toast.error(error || 'Failed to create habit. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="habit-name-input"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Habit Name *
          </label>
          <input
            id="habit-name-input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Read for 20 minutes"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            autoComplete="off"
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="habit-description-input"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Description (optional)
          </label>
          <textarea
            id="habit-description-input"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add more details about your habit..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
          />
        </div>

        {/* Habit Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Habit Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                formData.habitType === 'STANDARD'
                  ? 'border-emerald-500 bg-emerald-900 bg-opacity-20'
                  : 'border-gray-600 bg-gray-800 hover:bg-gray-750'
              }`}
            >
              <input
                type="radio"
                name="habitType"
                value="STANDARD"
                checked={formData.habitType === 'STANDARD'}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="flex flex-col">
                <div className="flex items-center">
                  <div className="text-lg">✅</div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-100">
                      Standard
                    </div>
                    <div className="text-xs text-gray-400">
                      Simple check-off
                    </div>
                  </div>
                </div>
              </div>
              {formData.habitType === 'STANDARD' && (
                <div className="absolute top-2 right-2">
                  <svg
                    className="h-4 w-4 text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </label>

            <label
              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                formData.habitType === 'TIMED'
                  ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                  : 'border-gray-600 bg-gray-800 hover:bg-gray-750'
              }`}
            >
              <input
                type="radio"
                name="habitType"
                value="TIMED"
                checked={formData.habitType === 'TIMED'}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="flex flex-col">
                <div className="flex items-center">
                  <div className="text-lg">⏱️</div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-100">
                      Timed
                    </div>
                    <div className="text-xs text-gray-400">Focus session</div>
                  </div>
                </div>
              </div>
              {formData.habitType === 'TIMED' && (
                <div className="absolute top-2 right-2">
                  <svg
                    className="h-4 w-4 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Timer Duration - Only show for timed habits */}
        {formData.habitType === 'TIMED' && (
          <div>
            <label
              htmlFor="timer-duration-input"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Focus Duration (minutes) *
            </label>
            <input
              id="timer-duration-input"
              type="number"
              name="timerDurationMinutes"
              value={formData.timerDurationMinutes}
              onChange={handleChange}
              min="1"
              max="480"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>Common: 25min (Pomodoro), 50min (Work block)</span>
              <span>Max: 8 hours</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
            isFormValid && !isLoading
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
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
              Creating...
            </span>
          ) : (
            `Add ${formData.habitType === 'TIMED' ? 'Timed' : ''} Habit`
          )}
        </button>
      </form>
    </div>
  )
}

export default AddHabitForm
