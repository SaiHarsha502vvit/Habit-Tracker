import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AdvancedSearchBar from './AdvancedSearchBar'
import AdvancedFiltersPanel from './AdvancedFiltersPanel'
import FolderTreeNavigation from './FolderTreeNavigation'
import EnhancedHabitItemWithPomodoro from './EnhancedHabitItemWithPomodoro'
import SessionPlanningModal from './SessionPlanningModal'
import CompletionCelebrationModal from './CompletionCelebrationModal'
import {
  selectSearchResults,
  selectSearchStatus,
  selectSearchError,
  selectActiveSessionSet,
  selectPomodoroSetsUI,
  fetchHabits,
  logHabit
} from '../features/habits/habitsSlice'
import {
  selectSearchUI,
  toggleAdvancedSearch,
  clearSearchResults
} from '../features/search/searchSlice'

/**
 * Enhanced Habit Dashboard with Full Search and Pomodoro Integration
 * Demonstrates the complete implementation of both Phase 1 and Phase 2 features
 */
export default function EnhancedHabitDashboard() {
  const dispatch = useDispatch()
  const searchResults = useSelector(selectSearchResults)
  const searchStatus = useSelector(selectSearchStatus)
  const searchError = useSelector(selectSearchError)
  const searchUI = useSelector(selectSearchUI)
  const pomodoroUI = useSelector(selectPomodoroSetsUI)
  
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  // Load habits on mount
  useEffect(() => {
    dispatch(fetchHabits())
  }, [dispatch])

  const handleToggleHabit = async (habitId) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      await dispatch(logHabit({ habitId, date: today })).unwrap()
    } catch (error) {
      console.error('Failed to log habit:', error)
    }
  }

  const handleClearSearch = () => {
    dispatch(clearSearchResults())
  }

  // Determine which habits to display
  const habitsToDisplay = searchResults.length > 0 ? searchResults : []

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Enhanced Habit Tracker</h1>
              <p className="text-gray-300 mt-2">
                Complete Pomodoro integration with advanced search & organization
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <AdvancedSearchBar />
            </div>
            
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
            </button>

            {searchResults.length > 0 && (
              <button
                onClick={handleClearSearch}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear Search</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Folder Navigation */}
          <div className="w-80 flex-shrink-0">
            <FolderTreeNavigation />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Results Summary */}
            {searchResults.length > 0 && (
              <div className="mb-6 p-4 bg-blue-900 bg-opacity-50 border border-blue-600 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-blue-100 font-semibold">Search Results</h3>
                    <p className="text-blue-200 text-sm">
                      Found {searchResults.length} habit{searchResults.length !== 1 ? 's' : ''} matching your criteria
                    </p>
                  </div>
                  <div className="text-blue-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {searchError && (
              <div className="mb-6 p-4 bg-red-900 bg-opacity-50 border border-red-600 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-red-100 font-semibold">Search Error</h3>
                    <p className="text-red-200 text-sm">{searchError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {searchStatus === 'loading' && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Searching habits...</p>
              </div>
            )}

            {/* Habits Display */}
            {habitsToDisplay.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {habitsToDisplay.map(habit => (
                  <EnhancedHabitItemWithPomodoro
                    key={habit.id}
                    habit={habit}
                    onToggle={handleToggleHabit}
                  />
                ))}
              </div>
            ) : searchResults.length === 0 && searchStatus !== 'loading' ? (
              // Empty State
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchUI.activeView === 'search' ? 'No matching habits found' : 'Start by searching or browsing folders'}
                </h3>
                <p className="text-gray-400 mb-8">
                  {searchUI.activeView === 'search' 
                    ? 'Try adjusting your search terms or filters'
                    : 'Use the search bar above or select a folder to find your habits'
                  }
                </p>
                <button
                  onClick={() => setShowFilters(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Open Advanced Search
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdvancedFiltersPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />

      {pomodoroUI.showSessionPlanning && (
        <SessionPlanningModal
          isOpen={pomodoroUI.showSessionPlanning}
          onClose={() => {}}
          habitId={pomodoroUI.planningHabitId}
          habitName="Selected Habit"
        />
      )}

      {pomodoroUI.showCompletionCelebration && (
        <CompletionCelebrationModal
          isOpen={pomodoroUI.showCompletionCelebration}
          sessionSet={pomodoroUI.completedSessionSet}
          habitName="Selected Habit"
          onClose={() => {}}
        />
      )}
    </div>
  )
}