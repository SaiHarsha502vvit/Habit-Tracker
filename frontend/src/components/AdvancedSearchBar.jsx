import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  performQuickSearch,
  fetchSearchSuggestions,
  setSearchQuery,
  clearSearchResults,
  selectSearchQuery,
  selectSuggestions,
  selectSearchHistory
} from '../features/search/searchSlice'

/**
 * Advanced Search Bar Component with Autocomplete
 */
export default function AdvancedSearchBar({ placeholder = "Search habits, tags, categories..." }) {
  const dispatch = useDispatch()
  const searchQuery = useSelector(selectSearchQuery)
  const suggestions = useSelector(selectSuggestions)
  const searchHistory = useSelector(selectSearchHistory)
  
  const [localQuery, setLocalQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceRef = useRef(null)

  // Sync local query with Redux state
  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  // Handle input changes with debounced suggestions
  const handleInputChange = (e) => {
    const query = e.target.value
    setLocalQuery(query)
    dispatch(setSearchQuery(query))

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length >= 2) {
      // Debounce suggestions fetch
      debounceRef.current = setTimeout(() => {
        dispatch(fetchSearchSuggestions(query))
        setShowSuggestions(true)
      }, 300)
    } else {
      setShowSuggestions(false)
    }
  }

  // Handle search submission
  const handleSearch = (query = localQuery) => {
    if (query.trim()) {
      dispatch(performQuickSearch(query.trim()))
      setShowSuggestions(false)
    } else {
      dispatch(clearSearchResults())
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return

    const allSuggestions = [
      ...suggestions.habitNames,
      ...suggestions.tags.map(tag => `#${tag}`),
      ...searchHistory.slice(0, 3).map(h => `"${h}"`)
    ]

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && allSuggestions[selectedSuggestionIndex]) {
          const suggestion = allSuggestions[selectedSuggestionIndex]
          const cleanSuggestion = suggestion.replace(/^[#"]+|[#"]+$/g, '') // Remove # and quotes
          setLocalQuery(cleanSuggestion)
          dispatch(setSearchQuery(cleanSuggestion))
          handleSearch(cleanSuggestion)
        } else {
          handleSearch()
        }
        break
      
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const cleanSuggestion = suggestion.replace(/^[#"]+|[#"]+$/g, '')
    setLocalQuery(cleanSuggestion)
    dispatch(setSearchQuery(cleanSuggestion))
    handleSearch(cleanSuggestion)
  }

  // Handle clear
  const handleClear = () => {
    setLocalQuery('')
    dispatch(setSearchQuery(''))
    dispatch(clearSearchResults())
    setShowSuggestions(false)
  }

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const allSuggestions = [
    ...suggestions.habitNames,
    ...suggestions.tags.map(tag => `#${tag}`),
    ...searchHistory.slice(0, 3).map(h => `"${h}"`)
  ].filter(Boolean)

  return (
    <div className="relative" ref={suggestionsRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          ref={searchRef}
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => localQuery.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Clear Button */}
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-8 flex items-center text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && allSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.habitNames.length > 0 && (
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-gray-400 mb-2">Habits</div>
              {suggestions.habitNames.map((habit, index) => (
                <button
                  key={`habit-${index}`}
                  onClick={() => handleSuggestionClick(habit)}
                  className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-700 ${
                    selectedSuggestionIndex === index ? 'bg-gray-700' : ''
                  }`}
                >
                  <span className="text-gray-200">{habit}</span>
                </button>
              ))}
            </div>
          )}

          {suggestions.tags.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-700">
              <div className="text-xs font-medium text-gray-400 mb-2">Tags</div>
              {suggestions.tags.map((tag, index) => (
                <button
                  key={`tag-${index}`}
                  onClick={() => handleSuggestionClick(`#${tag}`)}
                  className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-700 ${
                    selectedSuggestionIndex === suggestions.habitNames.length + index ? 'bg-gray-700' : ''
                  }`}
                >
                  <span className="text-blue-400">#{tag}</span>
                </button>
              ))}
            </div>
          )}

          {searchHistory.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-700">
              <div className="text-xs font-medium text-gray-400 mb-2">Recent Searches</div>
              {searchHistory.slice(0, 3).map((historyItem, index) => (
                <button
                  key={`history-${index}`}
                  onClick={() => handleSuggestionClick(historyItem)}
                  className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-700 ${
                    selectedSuggestionIndex === suggestions.habitNames.length + suggestions.tags.length + index ? 'bg-gray-700' : ''
                  }`}
                >
                  <span className="text-gray-300">"{historyItem}"</span>
                  <span className="text-xs text-gray-500 ml-2">Recent</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}