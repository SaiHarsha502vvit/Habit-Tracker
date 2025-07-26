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
  })

  const isLoading = status === 'loading'
  const isFormValid = formData.name.trim().length >= 3

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!isFormValid) {
      toast.error('Habit name must be at least 3 characters long')
      return
    }

    try {
      await dispatch(
        addNewHabit({
          name: formData.name.trim(),
          description: formData.description.trim(),
        })
      ).unwrap()

      // Clear form on success
      setFormData({ name: '', description: '' })

      // Show success message
      toast.success(`Habit '${formData.name}' created! ✅`)

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
            'Add Habit'
          )}
        </button>
      </form>
    </div>
  )
}

export default AddHabitForm
