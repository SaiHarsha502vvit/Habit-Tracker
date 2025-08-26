import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'

/**
 * Revolutionary File System State Management
 * Implements Composite Pattern for hierarchical file/folder structure
 */

// FileSystemEntity base class concept (implemented as factory functions)
export const createFileSystemEntity = (type, data) => ({
  id: data.id || Date.now().toString(),
  name: data.name,
  type, // 'file' | 'folder'
  createdAt: data.createdAt || new Date().toISOString(),
  modifiedAt: data.modifiedAt || new Date().toISOString(),
  parent: data.parent || null,
  metadata: data.metadata || {},
  ...data,
})

// Factory functions for different entity types
export const createHabitFile = (habit) => createFileSystemEntity('file', {
  ...habit,
  name: `${habit.name}.habit`,
  extension: '.habit',
  size: JSON.stringify(habit).length,
  habitData: habit,
  metadata: {
    priority: habit.priority || 'medium',
    category: habit.category?.name || 'Uncategorized',
    streak: habit.currentStreak || 0,
    completionRate: habit.completionRate || 0,
    lastCompleted: habit.lastCompletedDate,
    tags: habit.tags || [],
    difficulty: habit.difficulty || 'medium',
    estimatedDuration: habit.estimatedDuration || 30,
  }
})

export const createFolder = (name, parent = null) => createFileSystemEntity('folder', {
  name,
  parent,
  children: [],
  isExpanded: true,
  color: null,
  icon: 'folder',
})

// Async thunks for file system operations
export const createFolderAsync = createAsyncThunk(
  'fileSystem/createFolder',
  async ({ name, parent }) => {
    const folder = createFolder(name, parent)
    return folder
  }
)

export const moveEntityAsync = createAsyncThunk(
  'fileSystem/moveEntity',
  async ({ entityId, targetFolderId, index }) => {
    return { entityId, targetFolderId, index }
  }
)

export const renameEntityAsync = createAsyncThunk(
  'fileSystem/renameEntity',
  async ({ entityId, newName }) => {
    return { entityId, newName }
  }
)

export const deleteEntityAsync = createAsyncThunk(
  'fileSystem/deleteEntity',
  async ({ entityId }) => {
    return { entityId }
  }
)

const initialState = {
  // File system tree structure
  entities: {}, // All entities by ID
  rootFolders: [], // Top-level folder IDs
  selectedEntities: [], // Currently selected entity IDs
  
  // View state
  viewMode: 'list', // 'list' | 'grid' | 'tree'
  sortBy: 'name', // 'name' | 'modified' | 'size' | 'priority' | 'streak'
  sortOrder: 'asc', // 'asc' | 'desc'
  groupBy: 'none', // 'none' | 'category' | 'priority' | 'folder'
  
  // Search and filtering
  searchQuery: '',
  activeFilters: {
    category: null,
    priority: null,
    tags: [],
    dateRange: null,
    difficulty: null,
  },
  
  // Drag and drop state
  dragState: {
    isDragging: false,
    draggedEntity: null,
    dropTarget: null,
    dropIndex: null,
  },
  
  // File operations
  clipboard: {
    operation: null, // 'cut' | 'copy'
    entities: [],
  },
  
  // UI state
  showHidden: false,
  contextMenu: {
    visible: false,
    x: 0,
    y: 0,
    target: null,
  },
  
  loading: false,
  error: null,
}

const fileSystemSlice = createSlice({
  name: 'fileSystem',
  initialState,
  reducers: {
    // Entity management
    addEntity: (state, action) => {
      const entity = action.payload
      state.entities[entity.id] = entity
      
      if (entity.type === 'folder' && !entity.parent) {
        state.rootFolders.push(entity.id)
      }
    },
    
    removeEntity: (state, action) => {
      const entityId = action.payload
      const entity = state.entities[entityId]
      
      if (entity) {
        // Remove from parent's children
        if (entity.parent) {
          const parent = state.entities[entity.parent]
          if (parent) {
            parent.children = parent.children.filter(id => id !== entityId)
          }
        } else if (entity.type === 'folder') {
          // Remove from root folders
          state.rootFolders = state.rootFolders.filter(id => id !== entityId)
        }
        
        // Remove from entities
        delete state.entities[entityId]
        
        // Remove from selection
        state.selectedEntities = state.selectedEntities.filter(id => id !== entityId)
      }
    },
    
    updateEntity: (state, action) => {
      const { id, updates } = action.payload
      if (state.entities[id]) {
        state.entities[id] = { ...state.entities[id], ...updates }
      }
    },
    
    moveEntity: (state, action) => {
      const { entityId, targetFolderId, index } = action.payload
      const entity = state.entities[entityId]
      
      if (entity) {
        // Remove from old parent
        if (entity.parent) {
          const oldParent = state.entities[entity.parent]
          if (oldParent) {
            oldParent.children = oldParent.children.filter(id => id !== entityId)
          }
        } else {
          state.rootFolders = state.rootFolders.filter(id => id !== entityId)
        }
        
        // Update entity parent
        entity.parent = targetFolderId
        
        // Add to new parent
        if (targetFolderId) {
          const newParent = state.entities[targetFolderId]
          if (newParent) {
            if (index !== undefined) {
              newParent.children.splice(index, 0, entityId)
            } else {
              newParent.children.push(entityId)
            }
          }
        } else {
          if (index !== undefined) {
            state.rootFolders.splice(index, 0, entityId)
          } else {
            state.rootFolders.push(entityId)
          }
        }
      }
    },
    
    // Selection management
    selectEntity: (state, action) => {
      const { id, multiSelect = false } = action.payload
      
      if (multiSelect) {
        if (state.selectedEntities.includes(id)) {
          state.selectedEntities = state.selectedEntities.filter(entityId => entityId !== id)
        } else {
          state.selectedEntities.push(id)
        }
      } else {
        state.selectedEntities = [id]
      }
    },
    
    clearSelection: (state) => {
      state.selectedEntities = []
    },
    
    // View state
    setViewMode: (state, action) => {
      state.viewMode = action.payload
    },
    
    setSortBy: (state, action) => {
      const newSortBy = action.payload
      if (state.sortBy === newSortBy) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        state.sortBy = newSortBy
        state.sortOrder = 'asc'
      }
    },
    
    setGroupBy: (state, action) => {
      state.groupBy = action.payload
    },
    
    // Search and filtering
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    
    setActiveFilters: (state, action) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload }
    },
    
    clearFilters: (state) => {
      state.searchQuery = ''
      state.activeFilters = initialState.activeFilters
    },
    
    // Drag and drop
    setDragState: (state, action) => {
      state.dragState = { ...state.dragState, ...action.payload }
    },
    
    clearDragState: (state) => {
      state.dragState = initialState.dragState
    },
    
    // Clipboard operations
    copyEntities: (state, action) => {
      state.clipboard = {
        operation: 'copy',
        entities: action.payload,
      }
    },
    
    cutEntities: (state, action) => {
      state.clipboard = {
        operation: 'cut',
        entities: action.payload,
      }
    },
    
    clearClipboard: (state) => {
      state.clipboard = initialState.clipboard
    },
    
    // UI state
    toggleFolder: (state, action) => {
      const folderId = action.payload
      const folder = state.entities[folderId]
      if (folder && folder.type === 'folder') {
        folder.isExpanded = !folder.isExpanded
      }
    },
    
    setContextMenu: (state, action) => {
      state.contextMenu = action.payload
    },
    
    hideContextMenu: (state) => {
      state.contextMenu = { visible: false, x: 0, y: 0, target: null }
    },
    
    // Synchronization with habits
    syncWithHabits: (state, action) => {
      const habits = action.payload
      
      // Convert habits to file entities
      habits.forEach(habit => {
        const existingFile = Object.values(state.entities).find(
          entity => entity.type === 'file' && entity.habitData?.id === habit.id
        )
        
        if (existingFile) {
          // Update existing habit file
          const updatedFile = createHabitFile(habit)
          state.entities[existingFile.id] = {
            ...existingFile,
            ...updatedFile,
            id: existingFile.id, // Keep original ID
            parent: existingFile.parent, // Keep current parent
          }
        } else {
          // Create new habit file
          const habitFile = createHabitFile(habit)
          state.entities[habitFile.id] = habitFile
        }
      })
      
      // Remove habit files that no longer exist
      const habitIds = new Set(habits.map(h => h.id))
      Object.values(state.entities).forEach(entity => {
        if (entity.type === 'file' && entity.habitData && !habitIds.has(entity.habitData.id)) {
          delete state.entities[entity.id]
        }
      })
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(createFolderAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(createFolderAsync.fulfilled, (state, action) => {
        state.loading = false
        const folder = action.payload
        state.entities[folder.id] = folder
        
        if (!folder.parent) {
          state.rootFolders.push(folder.id)
        } else {
          const parent = state.entities[folder.parent]
          if (parent) {
            parent.children.push(folder.id)
          }
        }
      })
      .addCase(createFolderAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(moveEntityAsync.fulfilled, (state, action) => {
        fileSystemSlice.caseReducers.moveEntity(state, { payload: action.payload })
      })
      .addCase(renameEntityAsync.fulfilled, (state, action) => {
        const { entityId, newName } = action.payload
        if (state.entities[entityId]) {
          state.entities[entityId].name = newName
          state.entities[entityId].modifiedAt = new Date().toISOString()
        }
      })
      .addCase(deleteEntityAsync.fulfilled, (state, action) => {
        fileSystemSlice.caseReducers.removeEntity(state, { payload: action.payload.entityId })
      })
  },
})

export const {
  addEntity,
  removeEntity,
  updateEntity,
  moveEntity,
  selectEntity,
  clearSelection,
  setViewMode,
  setSortBy,
  setGroupBy,
  setSearchQuery,
  setActiveFilters,
  clearFilters,
  setDragState,
  clearDragState,
  copyEntities,
  cutEntities,
  clearClipboard,
  toggleFolder,
  setContextMenu,
  hideContextMenu,
  syncWithHabits,
} = fileSystemSlice.actions

// Selectors using reselect pattern
export const selectAllEntities = (state) => state.fileSystem.entities
export const selectRootFolders = (state) => state.fileSystem.rootFolders
export const selectSelectedEntities = (state) => state.fileSystem.selectedEntities
export const selectViewState = createSelector(
  [(state) => state.fileSystem.viewMode,
   (state) => state.fileSystem.sortBy,
   (state) => state.fileSystem.sortOrder,
   (state) => state.fileSystem.groupBy],
  (viewMode, sortBy, sortOrder, groupBy) => ({
    viewMode,
    sortBy,
    sortOrder,
    groupBy,
  })
)
export const selectSearchQuery = (state) => state.fileSystem.searchQuery
export const selectActiveFilters = (state) => state.fileSystem.activeFilters
export const selectDragState = (state) => state.fileSystem.dragState
export const selectClipboard = (state) => state.fileSystem.clipboard
export const selectContextMenu = (state) => state.fileSystem.contextMenu

// Complex selectors
export const selectFilteredAndSortedEntities = createSelector(
  [(state) => state.fileSystem.entities,
   (state) => state.fileSystem.searchQuery,
   (state) => state.fileSystem.activeFilters,
   (state) => state.fileSystem.sortBy,
   (state) => state.fileSystem.sortOrder],
  (entities, searchQuery, activeFilters, sortBy, sortOrder) => {
    const searchLower = searchQuery.toLowerCase()
    
    let filtered = Object.values(entities)
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(entity => 
        entity.name.toLowerCase().includes(searchLower) ||
        (entity.metadata?.tags && entity.metadata.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        )) ||
        (entity.metadata?.category && entity.metadata.category.toLowerCase().includes(searchLower))
      )
    }
    
    // Apply filters
    if (activeFilters.category) {
      filtered = filtered.filter(entity => entity.metadata?.category === activeFilters.category)
    }
    
    if (activeFilters.priority) {
      filtered = filtered.filter(entity => entity.metadata?.priority === activeFilters.priority)
    }
    
    if (activeFilters.tags.length > 0) {
      filtered = filtered.filter(entity => 
        entity.metadata?.tags && 
        activeFilters.tags.some(tag => entity.metadata.tags.includes(tag))
      )
    }
    
    if (activeFilters.difficulty) {
      filtered = filtered.filter(entity => entity.metadata?.difficulty === activeFilters.difficulty)
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal
      
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'modified':
          aVal = new Date(a.modifiedAt)
          bVal = new Date(b.modifiedAt)
          break
        case 'size':
          aVal = a.size || 0
          bVal = b.size || 0
          break
        case 'priority': {
          const priorityOrder = { low: 1, medium: 2, high: 3 }
          aVal = priorityOrder[a.metadata?.priority] || 2
          bVal = priorityOrder[b.metadata?.priority] || 2
          break
        }
        case 'streak':
          aVal = a.metadata?.streak || 0
          bVal = b.metadata?.streak || 0
          break
        default:
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    
    return filtered
  }
)

export const selectFolderTree = createSelector(
  [(state) => state.fileSystem.entities,
   (state) => state.fileSystem.rootFolders],
  (entities, rootFolders) => {
    const buildTree = (folderId = null) => {
      const children = []
      
      if (folderId === null) {
        // Root level
        rootFolders.forEach(id => {
          const entity = entities[id]
          if (entity) {
            children.push({
              ...entity,
              children: entity.type === 'folder' ? buildTree(id) : []
            })
          }
        })
        
        // Add files without parents
        Object.values(entities).forEach(entity => {
          if (entity.type === 'file' && !entity.parent) {
            children.push(entity)
          }
        })
      } else {
        // Specific folder
        const folder = entities[folderId]
        if (folder && folder.children) {
          folder.children.forEach(id => {
            const entity = entities[id]
            if (entity) {
              children.push({
                ...entity,
                children: entity.type === 'folder' ? buildTree(id) : []
              })
            }
          })
        }
      }
      
      return children
    }
    
    return buildTree()
  }
)

export default fileSystemSlice.reducer
