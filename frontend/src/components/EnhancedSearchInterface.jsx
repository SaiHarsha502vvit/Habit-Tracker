import { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  performQuickSearch,
  performAdvancedSearch,
  fetchSearchSuggestions,
  fetchUserTags,
  setSearchQuery,
  setFilter,
  clearFilters,
  toggleAdvancedSearch,
  selectSearchQuery,
  selectSearchResults,
  selectFilters,
  selectSuggestions,
  selectSearchStatus,
} from '../features/search/searchSlice'

/**
 * Enhanced Search Interface with Advanced Filtering and Watery Animations
 * Features:
 * - Real-time search with debouncing
 * - Advanced filters with smooth animations
 * - Tag-based filtering with auto-completion
 * - Beautiful watery fluid animations
 * - Responsive design with accessibility
 */
export default function EnhancedSearchInterface({ className = '' }) {
  const dispatch = useDispatch()

  // Authentication check
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Redux state
  const searchQuery = useSelector(selectSearchQuery)
  const searchResults = useSelector(selectSearchResults)
  const filters = useSelector(selectFilters)
  const suggestions = useSelector(selectSuggestions)
  const searchStatus = useSelector(selectSearchStatus)

  // Local state
  const [localQuery, setLocalQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const [activeTags, setActiveTags] = useState([])
  const [searchMode, setSearchMode] = useState('simple')

  const searchInputRef = useRef(null)
  const suggestionRefs = useRef([])

  // Simple debounce implementation
  const debouncedSearchRef = useRef()

  const debouncedSearch = useCallback(
    query => {
      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current)
      }

      debouncedSearchRef.current = setTimeout(() => {
        if (query.trim().length > 0) {
          dispatch(performQuickSearch(query))
          dispatch(fetchSearchSuggestions(query))
        }
      }, 300)
    },
    [dispatch]
  )

  // Initialize tags
  useEffect(() => {
    dispatch(fetchUserTags())
  }, [dispatch])

  // Handle search query changes
  useEffect(() => {
    if (localQuery !== searchQuery) {
      setLocalQuery(searchQuery)
    }
  }, [searchQuery, localQuery])

  // Perform search when query changes
  useEffect(() => {
    if (localQuery.trim().length >= 2) {
      debouncedSearch(localQuery)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }

    return () => {
      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current)
      }
    }
  }, [localQuery, debouncedSearch])

  const handleInputChange = e => {
    const value = e.target.value
    setLocalQuery(value)
    dispatch(setSearchQuery(value))
    setSelectedSuggestion(-1)
  }

  const handleInputFocus = () => {
    if (localQuery.length >= 2) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    // Delay hiding to allow suggestion clicks
    setTimeout(() => setShowSuggestions(false), 150)
  }

  const handleSuggestionClick = (suggestion, type) => {
    if (type === 'habit') {
      setLocalQuery(suggestion)
      dispatch(setSearchQuery(suggestion))
    } else if (type === 'tag') {
      addTag(suggestion)
    }
    setShowSuggestions(false)
    searchInputRef.current?.focus()
  }

  const handleKeyDown = e => {
    if (!showSuggestions) return

    const totalSuggestions =
      suggestions.habitNames.length + suggestions.tags.length

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestion(prev =>
          prev < totalSuggestions - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestion(prev => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestion >= 0) {
          const isTagSuggestion =
            selectedSuggestion >= suggestions.habitNames.length
          const suggestionIndex = isTagSuggestion
            ? selectedSuggestion - suggestions.habitNames.length
            : selectedSuggestion
          const suggestion = isTagSuggestion
            ? suggestions.tags[suggestionIndex]
            : suggestions.habitNames[suggestionIndex]
          const type = isTagSuggestion ? 'tag' : 'habit'
          handleSuggestionClick(suggestion, type)
        } else if (localQuery.trim()) {
          dispatch(performQuickSearch(localQuery))
          setShowSuggestions(false)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestion(-1)
        break
    }
  }

  const addTag = tag => {
    if (!activeTags.includes(tag)) {
      const newTags = [...activeTags, tag]
      setActiveTags(newTags)
      dispatch(setFilter({ key: 'tags', value: newTags }))
      performAdvancedSearchWithFilters()
    }
  }

  const removeTag = tagToRemove => {
    const newTags = activeTags.filter(tag => tag !== tagToRemove)
    setActiveTags(newTags)
    dispatch(setFilter({ key: 'tags', value: newTags }))
    performAdvancedSearchWithFilters()
  }

  const performAdvancedSearchWithFilters = () => {
    const criteria = {
      searchTerm: localQuery,
      ...filters,
      tags: activeTags,
    }
    dispatch(performAdvancedSearch(criteria))
  }

  const clearAllFilters = () => {
    setActiveTags([])
    setLocalQuery('')
    dispatch(clearFilters())
    dispatch(setSearchQuery(''))
    setSearchMode('simple')
  }

  const toggleAdvancedMode = () => {
    const newMode = searchMode === 'simple' ? 'advanced' : 'simple'
    setSearchMode(newMode)
    dispatch(toggleAdvancedSearch())
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const searchBarVariants = {
    focused: {
      scale: 1.02,
      boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    unfocused: {
      scale: 1,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const suggestionVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.95,
      transition: {
        duration: 0.15,
      },
    },
  }

  const tagVariants = {
    hidden: { opacity: 0, scale: 0.8, x: -20 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      x: 20,
      transition: {
        duration: 0.2,
      },
    },
  }

  // Check authentication status on mount and token changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setIsAuthenticated(!!token)
    }

    checkAuth()

    // Listen for storage changes (logout in another tab)
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  // Security Check: Don't render anything if user is not authenticated
  if (!isAuthenticated) {
    return null // Return null to hide the component completely
  }

  return (
    <motion.div
      className={`relative ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Search Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-xl">
        {/* Search Input Section */}
        <motion.div
          className="relative"
          variants={searchBarVariants}
          whileFocus="focused"
          animate="unfocused"
        >
          <div className="relative flex items-center">
            {/* Search Icon with Watery Animation */}
            <motion.div
              className="absolute left-4 z-10"
              animate={{
                scale: searchStatus === 'loading' ? [1, 1.1, 1] : 1,
                rotate: searchStatus === 'loading' ? [0, 360] : 0,
              }}
              transition={{
                duration: searchStatus === 'loading' ? 2 : 0.5,
                repeat: searchStatus === 'loading' ? Infinity : 0,
                ease: 'easeInOut',
              }}
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </motion.div>

            {/* Main Search Input */}
            <input
              ref={searchInputRef}
              type="text"
              value={localQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder="Search habits, tags, or categories..."
              className="w-full pl-12 pr-20 py-4 text-gray-900 dark:text-white bg-transparent border-0 focus:outline-none text-lg placeholder-gray-400 rounded-2xl"
              autoComplete="off"
            />

            {/* Advanced Search Toggle */}
            <motion.button
              onClick={toggleAdvancedMode}
              className={`absolute right-4 p-2 rounded-lg transition-colors ${
                searchMode === 'advanced'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          </div>

          {/* Search Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions &&
              (suggestions.habitNames.length > 0 ||
                suggestions.tags.length > 0) && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 max-h-64 overflow-y-auto"
                  variants={suggestionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Habit Name Suggestions */}
                  {suggestions.habitNames.length > 0 && (
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        HABITS
                      </div>
                      {suggestions.habitNames.map((habit, index) => (
                        <motion.div
                          key={habit}
                          ref={el => (suggestionRefs.current[index] = el)}
                          className={`p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedSuggestion === index
                              ? 'bg-blue-500 text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => handleSuggestionClick(habit, 'habit')}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.1 }}
                        >
                          <div className="flex items-center space-x-3">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>{habit}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Tag Suggestions */}
                  {suggestions.tags.length > 0 && (
                    <div className="p-3">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        TAGS
                      </div>
                      {suggestions.tags.map((tag, index) => {
                        const actualIndex =
                          suggestions.habitNames.length + index
                        return (
                          <motion.div
                            key={tag}
                            ref={el =>
                              (suggestionRefs.current[actualIndex] = el)
                            }
                            className={`p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedSuggestion === actualIndex
                                ? 'bg-green-500 text-white'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => handleSuggestionClick(tag, 'tag')}
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.1 }}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-green-500 text-sm">#</span>
                              <span>{tag}</span>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )}
          </AnimatePresence>
        </motion.div>

        {/* Active Tags Display */}
        <AnimatePresence>
          {activeTags.length > 0 && (
            <motion.div
              className="px-6 py-3 border-t border-gray-100 dark:border-gray-700"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
                  Active tags:
                </span>
                {activeTags.map(tag => (
                  <motion.span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    variants={tagVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-blue-600 focus:outline-none"
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Search Filters */}
        <AnimatePresence>
          {searchMode === 'advanced' && (
            <motion.div
              className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    value={filters.categoryId || ''}
                    onChange={e =>
                      dispatch(
                        setFilter({
                          key: 'categoryId',
                          value: e.target.value || null,
                        })
                      )
                    }
                  >
                    <option value="">All Categories</option>
                    {/* Categories would be populated from Redux state */}
                  </select>
                </motion.div>

                {/* Priority Filter */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    value={filters.priority || ''}
                    onChange={e =>
                      dispatch(
                        setFilter({
                          key: 'priority',
                          value: e.target.value || null,
                        })
                      )
                    }
                  >
                    <option value="">All Priorities</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </motion.div>

                {/* Sort Options */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort by
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    value={`${filters.sortBy}-${filters.sortDirection}`}
                    onChange={e => {
                      const [sortBy, sortDirection] = e.target.value.split('-')
                      dispatch(setFilter({ key: 'sortBy', value: sortBy }))
                      dispatch(
                        setFilter({
                          key: 'sortDirection',
                          value: sortDirection,
                        })
                      )
                    }}
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="created-desc">Newest First</option>
                    <option value="created-asc">Oldest First</option>
                    <option value="priority-desc">High Priority First</option>
                    <option value="streak-desc">Longest Streak First</option>
                  </select>
                </motion.div>
              </div>

              {/* Clear Filters Button */}
              <motion.div
                className="mt-4 flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Clear All Filters
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Results Summary */}
      {searchResults.length > 0 && (
        <motion.div
          className="mt-4 text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Found {searchResults.length} habit
          {searchResults.length !== 1 ? 's' : ''}
          {localQuery && (
            <span>
              {' '}
              matching "<span className="font-medium">{localQuery}</span>"
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
