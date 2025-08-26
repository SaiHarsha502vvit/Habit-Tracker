import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { addNewHabit, selectHabitsStatus } from '../features/habits/habitsSlice'
import { getCategories, getTimerPresets } from '../services/api'
import toast from 'react-hot-toast'

/**
 * Enhanced form component for adding new habits with Phase 1 features
 */
function AddHabitForm({ user }) {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectHabitsStatus)

  // Use user prop to determine authentication
  const isAuthenticated = !!user
  const [categories, setCategories] = useState([])
  const [timerPresets, setTimerPresets] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    habitType: 'STANDARD',
    timerDurationMinutes: 25,
    timerPreset: 'POMODORO_CLASSIC',
    categoryId: '',
    priority: 'MEDIUM',
    tags: [],
  })
  const [newTag, setNewTag] = useState('')

  const isLoading = status === 'loading'
  const isFormValid =
    formData.name.trim() &&
    (!formData.categoryId || formData.categoryId !== '') &&
    (formData.habitType !== 'TIMED' ||
      (formData.timerDurationMinutes >= 1 &&
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
        console.error('Error loading form data:', error)
        // Don't show error toast for unauthenticated users
        if (isAuthenticated) {
          toast.error('Failed to load categories and presets')
        }
      }
    }

    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  // Show authentication prompt if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-gray-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            Create Your First Habit
          </h3>
          <p className="text-gray-400 mb-6">
            Sign in to start building lasting habits and track your progress
          </p>
          <div className="text-sm text-gray-500 mb-6 space-y-2">
            <div>✨ Create unlimited habits</div>
            <div>📊 Track your streaks and progress</div>
            <div>🎯 Set goals and priorities</div>
            <div>📱 Get reminders and analytics</div>
          </div>
        </div>
      </div>
    )
  }

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

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag)) {
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
    if (!isFormValid) return

    try {
      await dispatch(addNewHabit(formData)).unwrap()
      toast.success('Habit created successfully! 🎉')

      // Reset form
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
    } catch (error) {
      toast.error('Failed to create habit. Please try again.')
      console.error('Error creating habit:', error)
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">
        🎯 Create New Habit
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Habit Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Habit Name * 📝
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Read for 20 minutes"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Description 📄
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your habit and goals..."
            rows="3"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-vertical"
          />
        </div>

        {/* Habit Type */}
        <div>
          <label
            htmlFor="habitType"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Habit Type ⚡
          </label>
          <select
            id="habitType"
            name="habitType"
            value={formData.habitType}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="STANDARD">✅ Standard</option>
            <option value="TIMED">⏱️ Timer-based (Pomodoro)</option>
          </select>
        </div>

        {/* Timer Settings (only for TIMED type) */}
        {formData.habitType === 'TIMED' && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="timerPreset"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Timer Preset ⏰
              </label>
              <select
                id="timerPreset"
                name="timerPreset"
                value={formData.timerPreset}
                onChange={handleTimerPresetChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="POMODORO_CLASSIC">
                  🍅 Classic Pomodoro (25 min)
                </option>
                <option value="DEEP_WORK">🧠 Deep Work (90 min)</option>
                <option value="CUSTOM">⚙️ Custom Duration</option>
              </select>
            </div>

            {formData.timerPreset === 'CUSTOM' && (
              <div>
                <label
                  htmlFor="timerDurationMinutes"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Duration (minutes) ⏱️
                </label>
                <input
                  type="number"
                  id="timerDurationMinutes"
                  name="timerDurationMinutes"
                  value={formData.timerDurationMinutes}
                  onChange={handleChange}
                  min="1"
                  max="480"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        )}

        {/* Category */}
        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Category 📂
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">📂 Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon || '📋'} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Priority 🎯
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="LOW">🟢 Low Priority</option>
            <option value="MEDIUM">🟡 Medium Priority</option>
            <option value="HIGH">🔴 High Priority</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags 🏷️
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-emerald-600 text-white rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:bg-emerald-700 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              placeholder="🏷️ Add a tag..."
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              onKeyPress={e =>
                e.key === 'Enter' && (e.preventDefault(), handleAddTag())
              }
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              ➕ Add
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isFormValid && !isLoading
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? '⏳ Creating Habit...' : '✨ Create Habit'}
        </button>
      </form>
    </div>
  )
}

export default AddHabitForm
