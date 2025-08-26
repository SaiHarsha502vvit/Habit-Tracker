import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

/**
 * Simple version to test - Revolutionary File System Interface for Habit Organization
 */
export default function HabitFileSystemSimple({
  habits: propHabits,
  onEditHabit,
  onCreateHabit,
}) {
  const reduxHabits = useSelector(state => state.habits.items)
  const habits = propHabits || reduxHabits

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [groupBy, setGroupBy] = useState('none')

  // Handle new habit creation - scroll to form
  const handleCreateNewHabit = () => {
    // Trigger the existing onCreateHabit prop (opens/shows form)
    if (onCreateHabit) {
      onCreateHabit()
    }

    // Scroll to the habit creation form after a short delay
    setTimeout(() => {
      const formElement =
        document.getElementById('habit-creation-form') ||
        document.querySelector('[data-testid="add-habit-form"]') ||
        document.querySelector('form')
      if (formElement) {
        formElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }, 100)
  }

  // Handle double-click on habit file - select and focus
  const handleHabitDoubleClick = habit => {
    // Trigger edit mode for the habit
    if (onEditHabit) {
      onEditHabit(habit)
    }

    // Find and scroll to the habit in the main interface
    setTimeout(() => {
      // Try to find the habit element in the main interface
      const habitElement =
        document.getElementById(`habit-${habit.id}`) ||
        document.querySelector(`[data-habit-id="${habit.id}"]`) ||
        document.querySelector('.habit-item.selected')

      if (habitElement) {
        habitElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
        // Highlight the selected habit
        habitElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50')

        // Remove highlight after 3 seconds
        setTimeout(() => {
          habitElement.classList.remove(
            'ring-2',
            'ring-blue-500',
            'ring-opacity-50'
          )
        }, 3000)
      }
    }, 100)
  }

  // Filter and sort habits
  const filteredHabits = useMemo(() => {
    if (!habits || habits.length === 0) return []

    let filtered = habits.filter(
      habit =>
        habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        habit.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        habit.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort logic
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'date':
        filtered.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )
        break
      case 'priority': {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
        filtered.sort(
          (a, b) =>
            (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1)
        )
        break
      }
      case 'streak':
        filtered.sort((a, b) => (b.streakCount || 0) - (a.streakCount || 0))
        break
    }

    return filtered
  }, [habits, searchQuery, sortBy])

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search files..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={groupBy}
            onChange={e => setGroupBy(e.target.value)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
          >
            <option value="none">📄 No Grouping</option>
            <option value="category">🗂️ By Category</option>
            <option value="priority">🎯 By Priority</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
          >
            <option value="name">📝 Name</option>
            <option value="date">📅 Date</option>
            <option value="priority">🎯 Priority</option>
            <option value="streak">📊 Streak</option>
          </select>

          <button
            onClick={handleCreateNewHabit}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {filteredHabits.map(habit => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-all duration-200"
              onClick={() => onEditHabit && onEditHabit(habit)}
              onDoubleClick={() => handleHabitDoubleClick(habit)}
              data-habit-id={habit.id}
              title={`Double-click to select and focus on ${habit.name}`}
            >
              {/* File Icon */}
              <div className="mr-3 text-2xl">
                {habit.type === 'TIMED' ? '⏰' : '📄'}
              </div>

              {/* File Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {habit.name}.habit
                  </span>
                  {habit.priority && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        habit.priority === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : habit.priority === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {habit.priority}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {habit.category?.name || 'Uncategorized'} •{' '}
                  {habit.streakCount || 0} day streak
                </div>
              </div>

              {/* File Size/Status */}
              <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                <div>{new Date(habit.createdAt).toLocaleDateString()}</div>
                <div className="text-xs">
                  {habit.isActive ? '✅ Active' : '⏸️ Paused'}
                </div>
              </div>
            </motion.div>
          ))}

          {filteredHabits.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">📁</div>
              <div className="text-lg font-medium mb-2">No habits found</div>
              <div className="text-sm">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Create your first habit to get started'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            {filteredHabits.length} file{filteredHabits.length !== 1 ? 's' : ''}
          </span>
          <span>🗂️ Habit File System v2.0</span>
        </div>
      </div>
    </div>
  )
}
