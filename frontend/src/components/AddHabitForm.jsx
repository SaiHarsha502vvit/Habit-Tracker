import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { addNewHabit, selectHabitsStatus } from '../features/habits/habitsSlice'
import { getCategories, getTimerPresets } from '../services/api'
import toast from 'react-hot-toast'

/**
 * Enhanced form component for adding new habits with Phase 1 features
 */
function AddHabitForm() {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectHabitsStatus)

  const [categories, setCategories] = useState([])
  const [timerPresets, setTimerPresets] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    habitType: 'STANDARD',
    timerDurationMinutes: 25, // Default Pomodoro duration
    timerPreset: 'POMODORO_CLASSIC',
    categoryId: '',
    priority: 'MEDIUM',
    tags: [],
  })
  const [newTag, setNewTag] = useState('')

  const isLoading = status === 'loading'
  const isFormValid =
    formData.name.trim().length >= 3 &&
    (formData.habitType === 'STANDARD' ||
      (formData.habitType === 'TIMED' &&
        formData.timerDurationMinutes >= 1 &&
        formData.timerDurationMinutes <= 480))

  // Load categories and timer presets on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, presetsData] = await Promise.all([
          getCategories(),
          getTimerPresets(),
        ])
        setCategories(categoriesData)
        setTimerPresets(presetsData)
      } catch (error) {
        console.log('Could not load categories/presets:', error.message)
        // Don't show error toast - these are optional features
      }
    }
    loadData()
  }, [])

  const handleChange = e => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }))
  }

  const handleTimerPresetChange = e => {
    const preset = e.target.value
    setFormData(prev => ({
      ...prev,
      timerPreset: preset,
      timerDurationMinutes:
        preset === 'CUSTOM'
          ? prev.timerDurationMinutes
          : timerPresets[preset]?.workMinutes || 25,
    }))
  }

  const handleAddTag = e => {
    e.preventDefault()
    const tag = newTag.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = tagToRemove => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
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
        priority: formData.priority,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      }

      // Add category if selected
      if (formData.categoryId) {
        habitData.categoryId = parseInt(formData.categoryId)
      }

      // Only include timer data for timed habits
      if (formData.habitType === 'TIMED') {
        habitData.timerDurationMinutes = formData.timerDurationMinutes
        if (formData.timerPreset !== 'CUSTOM') {
          habitData.timerPreset = formData.timerPreset
        }
      }

      await dispatch(addNewHabit(habitData)).unwrap()

      // Clear form on success
      setFormData({
        name: '',
        description: '',
        habitType: 'STANDARD',
        timerDurationMinutes: 25,
        timerPreset: 'POMODORO_CLASSIC',
        categoryId: '',
        priority: 'MEDIUM',
        tags: [],
      })
      setNewTag('')

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
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-gray-800 p-6 rounded-lg border border-gray-700"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">
            Create New Habit
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Build lasting habits with enhanced tracking features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
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
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
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
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
              />
            </div>

            {/* Category Selection */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category (optional)
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🔴 High</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Habit Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Habit Type *
              </label>
              <div className="grid grid-cols-1 gap-3">
                <label
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                    formData.habitType === 'STANDARD'
                      ? 'border-emerald-500 bg-emerald-900 bg-opacity-20'
                      : 'border-gray-600 bg-gray-700 hover:bg-gray-650'
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
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="text-lg">✅</div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-100">
                          Standard
                        </div>
                        <div className="text-xs text-gray-400">
                          Simple check-off habit
                        </div>
                      </div>
                    </div>
                    {formData.habitType === 'STANDARD' && (
                      <div className="text-emerald-400">✓</div>
                    )}
                  </div>
                </label>

                <label
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                    formData.habitType === 'TIMED'
                      ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                      : 'border-gray-600 bg-gray-700 hover:bg-gray-650'
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
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="text-lg">⏱️</div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-100">
                          Timed
                        </div>
                        <div className="text-xs text-gray-400">
                          Focus session with timer
                        </div>
                      </div>
                    </div>
                    {formData.habitType === 'TIMED' && (
                      <div className="text-blue-400">✓</div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Timer Configuration - Only show for timed habits */}
            {formData.habitType === 'TIMED' && (
              <div className="space-y-4">
                {/* Timer Preset Selection */}
                {Object.keys(timerPresets).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Timer Preset
                    </label>
                    <select
                      name="timerPreset"
                      value={formData.timerPreset}
                      onChange={handleTimerPresetChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(timerPresets).map(([key, preset]) => (
                        <option key={key} value={key}>
                          {preset.description || key}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Custom Timer Duration */}
                {(formData.timerPreset === 'CUSTOM' ||
                  !timerPresets[formData.timerPreset]) && (
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
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (optional, max 5)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-900 text-blue-200 border border-blue-600"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-300 hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {formData.tags.length < 5 && (
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleAddTag(e)}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-blue-600 border border-blue-600 rounded-r-lg text-white text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            isFormValid && !isLoading
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
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
              Creating Habit...
            </span>
          ) : (
            `Create ${formData.habitType === 'TIMED' ? 'Timed' : ''} Habit`
          )}
        </button>
      </form>
    </div>
  )
}

export default AddHabitForm
