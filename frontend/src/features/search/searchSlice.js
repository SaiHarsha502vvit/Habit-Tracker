import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  quickSearchHabits,
  advancedSearchHabits,
  getHabitsByFolder,
  getUncategorizedHabits,
  getUserTags,
  getSearchSuggestions,
  getFolderTree,
  getAllFolders,
  createHabitFolder,
  updateHabitFolder,
  deleteHabitFolder,
  searchFolders
} from '../../services/api'

/**
 * Async thunks for search and folder operations
 */

// Search operations
export const performQuickSearch = createAsyncThunk(
  'search/performQuickSearch',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const results = await quickSearchHabits(searchTerm)
      return { searchTerm, results }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed')
    }
  }
)

export const performAdvancedSearch = createAsyncThunk(
  'search/performAdvancedSearch',
  async (criteria, { rejectWithValue }) => {
    try {
      const results = await advancedSearchHabits(criteria)
      return { criteria, results }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Advanced search failed')
    }
  }
)

export const fetchHabitsByFolder = createAsyncThunk(
  'search/fetchHabitsByFolder',
  async (folderId, { rejectWithValue }) => {
    try {
      const habits = await getHabitsByFolder(folderId)
      return { folderId, habits }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch habits by folder')
    }
  }
)

export const fetchUncategorizedHabits = createAsyncThunk(
  'search/fetchUncategorizedHabits',
  async (_, { rejectWithValue }) => {
    try {
      const habits = await getUncategorizedHabits()
      return habits
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch uncategorized habits')
    }
  }
)

export const fetchUserTags = createAsyncThunk(
  'search/fetchUserTags',
  async (_, { rejectWithValue }) => {
    try {
      const tags = await getUserTags()
      return tags
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user tags')
    }
  }
)

export const fetchSearchSuggestions = createAsyncThunk(
  'search/fetchSearchSuggestions',
  async (partialInput, { rejectWithValue }) => {
    try {
      const suggestions = await getSearchSuggestions(partialInput)
      return suggestions
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suggestions')
    }
  }
)

// Folder operations
export const fetchFolderTree = createAsyncThunk(
  'search/fetchFolderTree',
  async (_, { rejectWithValue }) => {
    try {
      const folderTree = await getFolderTree()
      return folderTree
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch folder tree')
    }
  }
)

export const fetchAllFolders = createAsyncThunk(
  'search/fetchAllFolders',
  async (_, { rejectWithValue }) => {
    try {
      const folders = await getAllFolders()
      return folders
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch folders')
    }
  }
)

export const createFolder = createAsyncThunk(
  'search/createFolder',
  async (folderData, { rejectWithValue }) => {
    try {
      const folder = await createHabitFolder(folderData)
      return folder
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create folder')
    }
  }
)

export const updateFolder = createAsyncThunk(
  'search/updateFolder',
  async ({ folderId, updates }, { rejectWithValue }) => {
    try {
      const folder = await updateHabitFolder(folderId, updates)
      return folder
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update folder')
    }
  }
)

export const deleteFolder = createAsyncThunk(
  'search/deleteFolder',
  async (folderId, { rejectWithValue }) => {
    try {
      await deleteHabitFolder(folderId)
      return folderId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete folder')
    }
  }
)

/**
 * Initial state
 */
const initialState = {
  // Search state
  searchQuery: '',
  searchResults: [],
  searchHistory: [],
  savedSearches: [],
  
  // Advanced search filters
  filters: {
    categoryId: null,
    priority: null,
    habitType: null,
    folderId: null,
    tags: [],
    tagMatchAll: false,
    createdAfter: null,
    createdBefore: null,
    sortBy: 'name',
    sortDirection: 'asc'
  },
  
  // Suggestions
  suggestions: {
    habitNames: [],
    tags: [],
    categories: []
  },
  
  // User's available tags
  availableTags: [],
  
  // Folders
  folderTree: [],
  allFolders: [],
  selectedFolder: null,
  
  // UI state
  ui: {
    showAdvancedSearch: false,
    showFolderManager: false,
    searchMode: 'quick', // 'quick' | 'advanced' | 'folder'
    activeView: 'all' // 'all' | 'folder' | 'uncategorized' | 'search'
  },
  
  // Loading and error states
  status: 'idle',
  error: null
}

/**
 * Search and folders slice
 */
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // Search actions
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },

    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchQuery = ''
    },

    addToSearchHistory: (state, action) => {
      const query = action.payload
      if (query && !state.searchHistory.includes(query)) {
        state.searchHistory.unshift(query)
        // Keep only last 10 searches
        if (state.searchHistory.length > 10) {
          state.searchHistory = state.searchHistory.slice(0, 10)
        }
      }
    },

    // Filter actions
    setFilter: (state, action) => {
      const { key, value } = action.payload
      state.filters[key] = value
    },

    clearFilters: (state) => {
      state.filters = initialState.filters
    },

    // UI actions
    setSearchMode: (state, action) => {
      state.ui.searchMode = action.payload
    },

    setActiveView: (state, action) => {
      state.ui.activeView = action.payload
    },

    toggleAdvancedSearch: (state) => {
      state.ui.showAdvancedSearch = !state.ui.showAdvancedSearch
    },

    toggleFolderManager: (state) => {
      state.ui.showFolderManager = !state.ui.showFolderManager
    },

    setSelectedFolder: (state, action) => {
      state.selectedFolder = action.payload
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Quick search
      .addCase(performQuickSearch.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(performQuickSearch.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.searchResults = action.payload.results
        // Add to search history
        if (action.payload.searchTerm) {
          searchSlice.caseReducers.addToSearchHistory(state, { payload: action.payload.searchTerm })
        }
      })
      .addCase(performQuickSearch.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

      // Advanced search
      .addCase(performAdvancedSearch.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(performAdvancedSearch.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.searchResults = action.payload.results
      })
      .addCase(performAdvancedSearch.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

      // Habits by folder
      .addCase(fetchHabitsByFolder.fulfilled, (state, action) => {
        state.searchResults = action.payload.habits
        state.selectedFolder = action.payload.folderId
        state.ui.activeView = 'folder'
      })

      // Uncategorized habits
      .addCase(fetchUncategorizedHabits.fulfilled, (state, action) => {
        state.searchResults = action.payload
        state.ui.activeView = 'uncategorized'
      })

      // User tags
      .addCase(fetchUserTags.fulfilled, (state, action) => {
        state.availableTags = action.payload
      })

      // Search suggestions
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload
      })

      // Folder tree
      .addCase(fetchFolderTree.fulfilled, (state, action) => {
        state.folderTree = action.payload
      })

      // All folders
      .addCase(fetchAllFolders.fulfilled, (state, action) => {
        state.allFolders = action.payload
      })

      // Create folder
      .addCase(createFolder.fulfilled, (state, action) => {
        state.allFolders.push(action.payload)
        // Refresh folder tree would be handled by a separate action
      })

      // Update folder
      .addCase(updateFolder.fulfilled, (state, action) => {
        const index = state.allFolders.findIndex(f => f.id === action.payload.id)
        if (index !== -1) {
          state.allFolders[index] = action.payload
        }
      })

      // Delete folder
      .addCase(deleteFolder.fulfilled, (state, action) => {
        const folderId = action.payload
        state.allFolders = state.allFolders.filter(f => f.id !== folderId)
        if (state.selectedFolder === folderId) {
          state.selectedFolder = null
          state.ui.activeView = 'all'
        }
      })

      // Error handling for folder operations
      .addCase(createFolder.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(updateFolder.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.error = action.payload
      })
  }
})

export const {
  setSearchQuery,
  clearSearchResults,
  addToSearchHistory,
  setFilter,
  clearFilters,
  setSearchMode,
  setActiveView,
  toggleAdvancedSearch,
  toggleFolderManager,
  setSelectedFolder,
  clearError
} = searchSlice.actions

// Selectors
export const selectSearchQuery = (state) => state.search.searchQuery
export const selectSearchResults = (state) => state.search.searchResults
export const selectSearchHistory = (state) => state.search.searchHistory
export const selectFilters = (state) => state.search.filters
export const selectSuggestions = (state) => state.search.suggestions
export const selectAvailableTags = (state) => state.search.availableTags
export const selectFolderTree = (state) => state.search.folderTree
export const selectAllFolders = (state) => state.search.allFolders
export const selectSelectedFolder = (state) => state.search.selectedFolder
export const selectSearchUI = (state) => state.search.ui
export const selectSearchStatus = (state) => state.search.status
export const selectSearchError = (state) => state.search.error

export default searchSlice.reducer