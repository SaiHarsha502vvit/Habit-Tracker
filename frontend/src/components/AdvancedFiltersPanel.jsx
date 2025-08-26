import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  performAdvancedSearch,
  setFilter,
  clearFilters,
  fetchUserTags,
  fetchAllFolders,
  selectFilters,
  selectAvailableTags,
  selectAllFolders
} from '../features/search/searchSlice'
import { getCategories } from '../services/api'

/**
 * Advanced Filters Panel Component
 * Provides comprehensive filtering options for habit search
 */
export default function AdvancedFiltersPanel({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const filters = useSelector(selectFilters)
  const availableTags = useSelector(selectAvailableTags)
  const allFolders = useSelector(selectAllFolders)
  
  const [categories, setCategories] = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUserTags())
      dispatch(fetchAllFolders())
      loadCategories()
    }
  }, [isOpen, dispatch])

  // Sync selected tags with filters
  useEffect(() => {
    setSelectedTags(filters.tags || [])
  }, [filters.tags])

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    dispatch(setFilter({ key, value }))
  }

  const handleTagToggle = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    
    setSelectedTags(newTags)
    handleFilterChange('tags', newTags)
  }

  const handleApplyFilters = () => {
    const searchCriteria = {
      ...filters,
      tags: selectedTags
    }
    dispatch(performAdvancedSearch(searchCriteria))
    onClose()
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
    setSelectedTags([])
  }

  const hasActiveFilters = () => {
    return filters.categoryId || 
           filters.priority || 
           filters.habitType || 
           filters.folderId || 
           (filters.tags && filters.tags.length > 0) ||
           filters.createdAfter ||
           filters.createdBefore
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Advanced Search Filters</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Category
            </label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value || null)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Priority
            </label>
            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value || null)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">🔥 High Priority</option>
              <option value="MEDIUM">⚡ Medium Priority</option>
              <option value="LOW">🌱 Low Priority</option>
            </select>
          </div>

          {/* Habit Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Habit Type
            </label>
            <select
              value={filters.habitType || ''}
              onChange={(e) => handleFilterChange('habitType', e.target.value || null)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="STANDARD">📝 Standard Habits</option>
              <option value="TIMED">🍅 Timed/Pomodoro Habits</option>
            </select>
          </div>

          {/* Folder Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Folder
            </label>
            <select
              value={filters.folderId || ''}
              onChange={(e) => handleFilterChange('folderId', e.target.value || null)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Folders</option>
              {allFolders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.icon} {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Created After */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Created After
            </label>
            <input
              type="date"
              value={filters.createdAfter || ''}
              onChange={(e) => handleFilterChange('createdAfter', e.target.value || null)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Created Before */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Created Before
            </label>
            <input
              type="date"
              value={filters.createdBefore || ''}
              onChange={(e) => handleFilterChange('createdBefore', e.target.value || null)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tags Filter */}
        {availableTags.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-200">
                Tags ({selectedTags.length} selected)
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={filters.tagMatchAll}
                    onChange={(e) => handleFilterChange('tagMatchAll', e.target.checked)}
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <span>Must have ALL selected tags</span>
                </label>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto bg-gray-700 p-3 rounded-lg border border-gray-600">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Name</option>
              <option value="created">Date Created</option>
              <option value="priority">Priority</option>
              <option value="category">Category</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Sort Direction
            </label>
            <select
              value={filters.sortDirection}
              onChange={(e) => handleFilterChange('sortDirection', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="asc">Ascending (A-Z, Low-High)</option>
              <option value="desc">Descending (Z-A, High-Low)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {hasActiveFilters() ? 'Filters applied' : 'No filters applied'}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}