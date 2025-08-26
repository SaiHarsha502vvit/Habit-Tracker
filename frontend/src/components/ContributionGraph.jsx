import { useEffect, useMemo, memo } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  fetchLogsForYear,
  selectLogsForHabit,
} from '../features/habits/habitsSlice'
import { Tooltip } from 'react-tooltip'

/**
 * GitHub-style contribution graph component
 */
function ContributionGraph({ habitId, year }) {
  const dispatch = useAppDispatch()

  // Get logs data for this habit
  const logsData = useAppSelector(state => selectLogsForHabit(state, habitId))

  // Debug logging only in development (removed in production)
  // console.log('🔍 ContributionGraph Debug:', {
  //   habitId,
  //   year,
  //   logsStatus: logsData.status,
  //   completionsCount: logsData.completions?.length || 0,
  // })

  // Fetch logs for the year if not already loaded
  useEffect(() => {
    if (logsData.status === 'idle') {
      dispatch(fetchLogsForYear({ habitId, year }))
    }
  }, [dispatch, habitId, year, logsData.status])

  // Convert logs array to Set for O(1) lookups
  const completionSet = useMemo(
    () => new Set(logsData.completions),
    [logsData.completions]
  )

  // Generate grid data for the year
  const gridData = useMemo(() => {
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year, 11, 31)

    // Get the day of the week for January 1st (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = startOfYear.getDay()

    // Create filler days for the first week
    const fillerDays = Array.from({ length: startDayOfWeek }, (_, index) => ({
      type: 'filler',
      key: `filler-${index}`,
    }))

    // Generate all days of the year
    const yearDays = []
    const currentDate = new Date(startOfYear)

    while (currentDate <= endOfYear) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const isCompleted = completionSet.has(dateStr)

      yearDays.push({
        type: 'day',
        date: dateStr,
        displayDate: currentDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        isCompleted,
        key: dateStr,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return [...fillerDays, ...yearDays]
  }, [year, completionSet])

  // Get CSS class for day squares
  const getDayClass = day => {
    const baseClasses = 'w-3 h-3 rounded-sm transition-colors duration-200'

    if (day.type === 'filler') {
      return `${baseClasses} bg-transparent`
    }

    if (day.isCompleted) {
      return `${baseClasses} bg-emerald-600 hover:bg-emerald-500`
    }

    return `${baseClasses} bg-gray-700 hover:bg-gray-600`
  }

  // Calculate streak and total completions
  const totalCompletions = logsData.completions.length
  const currentStreak = useMemo(() => {
    if (totalCompletions === 0) return 0

    const today = new Date().toISOString().split('T')[0]

    let streak = 0
    let currentDate = new Date(today)

    // Check if today is completed
    if (completionSet.has(today)) {
      streak = 1
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      // If today is not completed, check yesterday
      currentDate.setDate(currentDate.getDate() - 1)
      const yesterday = currentDate.toISOString().split('T')[0]
      if (!completionSet.has(yesterday)) {
        return 0
      }
      streak = 1
      currentDate.setDate(currentDate.getDate() - 1)
    }

    // Count consecutive days backwards
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      if (completionSet.has(dateStr)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }, [completionSet, totalCompletions])

  // Loading state
  if (logsData.status === 'loading') {
    return (
      <div className="w-full">
        <h4 className="text-sm font-medium text-gray-300 mb-3">
          {year} Progress
        </h4>
        <div className="grid grid-flow-col grid-rows-7 gap-1 w-full overflow-x-auto pb-2">
          {Array.from({ length: 53 * 7 }, (_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm bg-gray-700 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (logsData.status === 'failed') {
    return (
      <div className="w-full">
        <h4 className="text-sm font-medium text-gray-300 mb-3">
          {year} Progress
        </h4>
        <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3">
          Failed to load progress data: {logsData.error}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-300">{year} Progress</h4>
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          {currentStreak > 0 && (
            <span className="flex items-center">
              <span className="text-orange-400 mr-1">🔥</span>
              {currentStreak} day{currentStreak !== 1 ? 's' : ''}
            </span>
          )}
          <span>{totalCompletions} total</span>
        </div>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-1 w-full overflow-x-auto pb-2">
        {gridData.map(day => (
          <div
            key={day.key}
            className={getDayClass(day)}
            data-tooltip-id="graph-tooltip"
            data-tooltip-content={
              day.type === 'day'
                ? day.isCompleted
                  ? `Completed on: ${day.displayDate}`
                  : `No completion on: ${day.displayDate}`
                : undefined
            }
          />
        ))}
      </div>

      <Tooltip
        id="graph-tooltip"
        className="!bg-gray-800 !text-gray-100 !border !border-gray-600 !text-xs !px-2 !py-1 !rounded !shadow-lg"
      />

      {/* Legend */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-700 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-800 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default memo(ContributionGraph)
