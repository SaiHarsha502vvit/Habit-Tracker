import { useAppSelector } from '../app/hooks'
import {
  selectHabitIds,
  selectHabitsStatus,
  selectHabitsError,
} from '../features/habits/habitsSlice'
import HabitItem from './HabitItem'

/**
 * Component that renders the list of all habits
 */
function HabitList() {
  const habitIds = useAppSelector(selectHabitIds)
  const status = useAppSelector(selectHabitsStatus)
  const error = useAppSelector(selectHabitsError)

  // Loading state
  if (status === 'loading' && habitIds.length === 0) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="w-5 h-5 bg-gray-700 rounded"></div>
            </div>
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
            </div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (status === 'failed') {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">Failed to load habits</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (habitIds.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            Build habits that last.
          </h2>
          <p className="text-gray-400 mb-6">
            Start by adding your first habit above.
          </p>
        </div>
      </div>
    )
  }

  // Habits list
  return (
    <div className="space-y-6">
      {habitIds.map(habitId => (
        <HabitItem key={habitId} habitId={habitId} />
      ))}
    </div>
  )
}

export default HabitList
