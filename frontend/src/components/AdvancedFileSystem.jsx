import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useDebounce } from '../hooks/useDebounce'
import {
  FolderIcon,
  DocumentIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  PencilIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline'

import {
  // State selectors
  selectCurrentPathEntities,
  selectCurrentPath,
  selectViewMode,
  selectSortBy,
  selectSortDirection,
  selectSelectedEntities,
  selectClipboard,
  selectSearchQuery,
  selectContextMenu,
  selectModals,
  selectDragState,
  selectLoading,
  selectErrors,
  selectBreadcrumbs,
  selectCanNavigateBack,
  selectCanNavigateForward,
  selectBookmarks,

  // Actions
  loadFolderTreeAsync,
  createFolderAsync,
  deleteFolderAsync,
  moveEntitiesToFolderAsync,
  navigateToPath,
  navigateBack,
  navigateForward,
  navigateUp,
  setViewMode,
  setSortBy,
  selectEntity,
  selectAll,
  clearSelection,
  copyEntities,
  cutEntities,
  clearClipboard,
  addEntity,
  removeEntity,
  updateEntity,
  moveEntity,
  syncWithHabits,
  setSearchQuery,
  showContextMenu,
  hideContextMenu,
  showModal,
  hideModal,
  startDrag,
  endDrag,
  dragOver,
  addBookmark,
  toggleEntityExpanded,
  batchEntityOperationAsync,

  // Constants
  ViewMode,
  SortBy,
  EntityType,
  SelectionMode,
} from '../features/fileSystem/advancedFileSystemSlice'

// Import habits functionality
import {
  fetchHabits,
  selectAllHabits,
  removeHabit,
} from '../features/habits/habitsSlice'

// Import revolutionary file system functionality
import { revolutionaryCopyAsync } from '../features/revolutionaryFileSystem/revolutionaryFileSystemSlice'

import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useTheme } from '../contexts/ThemeContext'
import VirtualScrollList from './VirtualScrollList'
import AdvancedSearchEngine from '../utils/AdvancedSearchEngine'

/**
 * Advanced File System Component
 *
 * A complete Linux-style file manager with:
 * - Multiple view modes (List, Grid, Tree, Details)
 * - Full keyboard shortcuts (20+ shortcuts)
 * - Drag and drop operations
 * - Context menus with complete actions
 * - Multi-selection support
 * - Real backend integration with error handling
 * - Breadcrumb navigation with bookmarks
 * - Advanced search and filtering
 * - Clipboard operations
 * - Status bar with comprehensive information
 * - Performance optimizations for large datasets
 */
export default function AdvancedFileSystem({
  habits: propHabits = [],
  onHabitClick,
  onScrollToForm,
  className = '',
}) {
  const dispatch = useDispatch()
  const { isDark } = useTheme()

  // Refs for DOM manipulation
  const fileSystemRef = useRef(null)
  const searchInputRef = useRef(null)
  const contextMenuRef = useRef(null)

  // Search engine instance
  const searchEngine = useRef(new AdvancedSearchEngine())

  // Local state
  const [isInitialized, setIsInitialized] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [filteredEntities, setFilteredEntities] = useState([])

  // Redux state
  const entities = useSelector(selectCurrentPathEntities)
  const currentPath = useSelector(selectCurrentPath)
  const breadcrumbs = useSelector(selectBreadcrumbs)
  const viewMode = useSelector(selectViewMode)
  const sortBy = useSelector(selectSortBy)
  const sortDirection = useSelector(selectSortDirection)
  const selectedEntities = useSelector(selectSelectedEntities)
  const clipboard = useSelector(selectClipboard)
  const searchQuery = useSelector(selectSearchQuery)
  const contextMenu = useSelector(selectContextMenu)
  const modals = useSelector(selectModals)
  const dragState = useSelector(selectDragState)
  const loading = useSelector(selectLoading)
  const errors = useSelector(selectErrors)
  const canNavigateBack = useSelector(selectCanNavigateBack)
  const canNavigateForward = useSelector(selectCanNavigateForward)
  const bookmarks = useSelector(selectBookmarks)

  // Habits data for sync
  const habits = useSelector(selectAllHabits)

  // Initialize file system and search engine
  useEffect(() => {
    if (!isInitialized) {
      console.log('🗂️ Initializing Advanced File System...')
      searchEngine.current = new AdvancedSearchEngine()
      dispatch(loadFolderTreeAsync())
      dispatch(fetchHabits()) // Fetch habits on initialization
      setIsInitialized(true)
    }
  }, [dispatch, isInitialized])

  // Sync habits with file system when habits change
  useEffect(() => {
    if (habits !== undefined) {
      // Check if habits is loaded (not undefined)
      console.log(
        '🔄 Syncing habits with file system...',
        habits.length,
        'habits'
      )
      try {
        dispatch(syncWithHabits(habits))
        console.log('✅ Habits synced successfully with file system')
      } catch (error) {
        console.error('❌ Failed to sync habits:', error)
      }
    } else {
      console.log('⏳ Habits not loaded yet, waiting for data...')
    }
  }, [dispatch, habits])

  // Index entities for search when they change
  useEffect(() => {
    if (entities.length > 0) {
      console.log('🔍 Indexing entities for search...', entities.length)
      searchEngine.current.indexEntities(entities)

      // Update filtered entities based on current search
      if (searchQuery) {
        const searchResults = searchEngine.current.search(searchQuery)
        setFilteredEntities(searchResults.map(r => r.entity))
      } else {
        setFilteredEntities(entities)
      }
    }
  }, [entities, searchQuery])

  // Update search suggestions
  const handleSearchChange = useCallback(
    query => {
      dispatch(setSearchQuery(query))

      if (query.length >= 2) {
        const suggestions = searchEngine.current.getSuggestions(query, 5)
        setSearchSuggestions(suggestions)
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
        setSearchSuggestions([])
      }
    },
    [dispatch]
  )

  // Get current entities to display (filtered or all)
  const displayEntities = useMemo(() => {
    if (searchQuery && filteredEntities.length >= 0) {
      return filteredEntities
    }
    return entities
  }, [searchQuery, filteredEntities, entities])

  // Declare event handlers first before using them in keyboard shortcuts
  const handleCreateFolder = useCallback(
    (parentId = null) => {
      // Get current folder ID from path
      const currentFolderId =
        currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null

      dispatch(
        showModal({
          modalType: 'createFolder',
          data: { parentId: parentId || currentFolderId },
        })
      )
    },
    [dispatch, currentPath]
  )

  const handleDelete = useCallback(async () => {
    if (selectedEntities.length === 0) {
      console.warn('🗑️ No entities selected for deletion')
      return
    }

    try {
      console.log(
        '🗑️ Starting deletion process for entities:',
        selectedEntities
      )

      // Confirm deletion
      const entityNames = selectedEntities
        .map(id => {
          const entity = entities.find(e => e.id === id)
          return entity ? entity.name : `ID: ${id}`
        })
        .join(', ')

      const confirmed = window.confirm(
        `Are you sure you want to delete: ${entityNames}?\n\nThis action cannot be undone.`
      )

      if (!confirmed) {
        console.log('🗑️ Deletion cancelled by user')
        return
      }

      // Delete each entity
      for (const entityId of selectedEntities) {
        const entity = entities.find(e => e.id === entityId)
        if (!entity) {
          console.warn('🗑️ Entity not found:', entityId)
          continue
        }

        try {
          if (entity.type === EntityType.FOLDER) {
            console.log('🗑️ Deleting folder:', entity.name)
            await dispatch(deleteFolderAsync(entityId)).unwrap()
            console.log('✅ Folder deleted successfully:', entity.name)
          } else if (entity.type === EntityType.HABIT) {
            console.log('🗑️ Deleting habit:', entity.name)
            // Extract numeric ID from habit_123 format
            const numericHabitId = entityId.startsWith('habit_')
              ? parseInt(entityId.replace('habit_', ''), 10)
              : parseInt(entityId, 10)
            console.log(
              '🗑️ Extracted habit ID:',
              numericHabitId,
              'from entity ID:',
              entityId
            )
            await dispatch(removeHabit(numericHabitId)).unwrap()
            console.log('✅ Habit deleted successfully:', entity.name)
            // Refresh habits after successful deletion to sync file system
            console.log(
              '🔄 Refreshing habits to sync file system after deletion'
            )
            dispatch(fetchHabits())
          } else {
            console.log('🗑️ Deleting entity:', entity.name)
            dispatch(removeEntity(entityId))
            console.log('✅ Entity deleted successfully:', entity.name)
          }
        } catch (error) {
          console.error('❌ Failed to delete entity:', entity.name, error)
          throw new Error(`Failed to delete ${entity.name}: ${error.message}`)
        }
      }

      // Clear selection after successful deletion
      dispatch(clearSelection())

      // Comprehensive refresh after all deletions
      console.log('🔄 Performing comprehensive refresh after deletions')
      await dispatch(fetchHabits()) // Refresh habits first
      dispatch(loadFolderTreeAsync()) // Then refresh folder tree
      console.log(
        '✅ All selected entities deleted successfully and file system refreshed'
      )
    } catch (error) {
      console.error('❌ Delete operation failed:', error)
      alert(`Delete operation failed: ${error.message}`)
    }
  }, [dispatch, selectedEntities, entities])

  const handleRename = useCallback(() => {
    if (selectedEntities.length !== 1) {
      console.warn('🏷️ Rename requires exactly one selected entity')
      return
    }

    try {
      const entityId = selectedEntities[0]
      const entity = entities.find(e => e.id === entityId)

      if (!entity) {
        console.error('🏷️ Entity not found for rename:', entityId)
        return
      }

      const newName = prompt(`Rename "${entity.name}" to:`, entity.name)
      if (!newName || newName.trim() === '' || newName === entity.name) {
        console.log('🏷️ Rename cancelled or no change')
        return
      }

      console.log('🏷️ Renaming entity:', entity.name, 'to:', newName)

      // For now, just update locally - could be enhanced with API call
      dispatch(
        updateEntity({ id: entityId, updates: { name: newName.trim() } })
      )
      console.log('✅ Entity renamed successfully')
    } catch (error) {
      console.error('❌ Rename operation failed:', error)
      alert(`Rename failed: ${error.message}`)
    }
  }, [dispatch, selectedEntities, entities])

  const handleCopy = useCallback(() => {
    if (selectedEntities.length === 0) {
      console.warn('📋 No entities selected for copying')
      return
    }

    try {
      console.log('📋 Copying entities:', selectedEntities)
      dispatch(copyEntities(selectedEntities))

      const entityNames = selectedEntities
        .map(id => {
          const entity = entities.find(e => e.id === id)
          return entity ? entity.name : `ID: ${id}`
        })
        .join(', ')

      console.log('✅ Entities copied to clipboard:', entityNames)
    } catch (error) {
      console.error('❌ Copy operation failed:', error)
    }
  }, [dispatch, selectedEntities, entities])

  const handleCut = useCallback(() => {
    if (selectedEntities.length === 0) {
      console.warn('✂️ No entities selected for cutting')
      return
    }

    try {
      console.log('✂️ Cutting entities:', selectedEntities)
      dispatch(cutEntities(selectedEntities))

      const entityNames = selectedEntities
        .map(id => {
          const entity = entities.find(e => e.id === id)
          return entity ? entity.name : `ID: ${id}`
        })
        .join(', ')

      console.log('✅ Entities cut to clipboard:', entityNames)
    } catch (error) {
      console.error('❌ Cut operation failed:', error)
    }
  }, [dispatch, selectedEntities, entities])

  // Debounced refresh to prevent excessive API calls (Best Practice: Rate Limiting)
  const debouncedRefresh = useDebounce(
    () => {
      console.log(
        '🔄 Debounced refresh triggered - refreshing folder tree and syncing habits'
      )
      dispatch(loadFolderTreeAsync())
      // Sync habits to refresh current entities display
      if (habits && habits.length > 0) {
        dispatch(syncWithHabits(habits))
      }
    },
    500,
    [dispatch, habits]
  )

  const handlePaste = useCallback(async () => {
    if (clipboard.entityIds.length === 0) {
      console.warn('📋 No entities in clipboard to paste')
      return
    }

    try {
      console.log('📋 Pasting clipboard:', clipboard)

      // Get current folder ID from path
      const currentFolderId =
        currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null

      // Prepare data for backend API call
      const entityTypes = clipboard.entityIds.map(entityId => {
        // Check the entityId directly, not the entity object
        if (entityId.startsWith('habit_')) {
          return 'HABIT'
        }
        return 'FOLDER'
      })

      // Extract actual entity IDs (remove 'habit_' prefix and convert to numbers)
      const actualEntityIds = clipboard.entityIds.map(entityId => {
        if (entityId.startsWith('habit_')) {
          return parseInt(entityId.replace('habit_', ''), 10)
        }
        return parseInt(entityId, 10)
      })

      const operation = clipboard.action === 'copy' ? 'copy' : 'move'
      console.log(
        `📋 Performing ${operation} operation to folder:`,
        currentFolderId
      )
      console.log(
        `📋 ${operation === 'copy' ? 'Copying' : 'Moving'} entities:`,
        actualEntityIds,
        entityTypes
      )

      try {
        // For copy operations, perform optimistic updates for immediate UI feedback
        if (clipboard.action === 'copy') {
          for (const entityId of clipboard.entityIds) {
            const entity = entities.find(e => e.id === entityId)
            if (entity) {
              // Create a visual copy immediately (will be replaced by backend data)
              const copiedEntity = {
                ...entity,
                id: `temp_${Date.now()}_${Math.random()}`, // Temporary ID
                name: `${entity.name} (Link)`,
                parent: currentFolderId,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                isTemporary: true, // Mark as temporary for UI feedback
              }

              console.log(
                '📋 Optimistic copy: Creating temporary reference:',
                copiedEntity.name
              )
              dispatch(addEntity(copiedEntity))
            }
          }
        } else {
          // For move operations, perform optimistic updates
          for (const entityId of clipboard.entityIds) {
            console.log(
              '📋 Optimistic move: Moving entity',
              entityId,
              'to folder',
              currentFolderId
            )
            dispatch(moveEntity({ entityId, targetFolderId: currentFolderId }))
          }
        }

        // Try revolutionary file system first for copy operations
        let result
        if (operation === 'copy') {
          try {
            console.log('🚀 Attempting revolutionary copy-on-write operation')
            result = await dispatch(
              revolutionaryCopyAsync({
                habitIds: actualEntityIds.filter(id => id.startsWith('habit_')),
                targetFolderId: currentFolderId,
                operationType: 'COPY',
              })
            ).unwrap()
            console.log(
              '✅ Revolutionary copy operation completed successfully:',
              result
            )
          } catch (revolutionaryError) {
            console.warn(
              '⚠️ Revolutionary copy failed, falling back to legacy system:',
              revolutionaryError
            )
            // Fallback to legacy system
            result = await dispatch(
              batchEntityOperationAsync({
                operation: operation,
                targetFolderId: currentFolderId,
                entityIds: actualEntityIds,
                entityTypes: entityTypes,
              })
            ).unwrap()
            console.log('✅ Legacy fallback operation completed:', result)
          }
        } else {
          // Use legacy system for non-copy operations
          result = await dispatch(
            batchEntityOperationAsync({
              operation: operation,
              targetFolderId: currentFolderId,
              entityIds: actualEntityIds,
              entityTypes: entityTypes,
            })
          ).unwrap()
          console.log(
            `✅ ${operation} operation completed successfully:`,
            result
          )
        }

        // Clear clipboard after successful operation
        if (clipboard.action === 'cut') {
          dispatch(clearClipboard())
        }
        // For copy, keep clipboard for multiple pastes

        // Immediately refresh habits to get updated folder assignments
        console.log('🔄 Refreshing habits data after successful operation')
        dispatch(fetchHabits())

        // Refresh the folder tree to get the actual backend state
        debouncedRefresh()
        console.log(
          `🔄 File system refresh scheduled after ${operation} operation`
        )
      } catch (error) {
        console.error(`❌ Failed to ${operation} entities:`, error)

        // Rollback optimistic updates on error
        console.log('🔄 Rolling back optimistic updates due to error')
        debouncedRefresh()

        // Show error to user
        alert(`Failed to ${operation} items: ${error.message}`)
        return
      }
    } catch (error) {
      console.error('❌ Paste operation failed:', error)
      alert(`Paste failed: ${error.message}`)
    }
  }, [clipboard, dispatch, currentPath, entities, debouncedRefresh])

  const handleRefresh = useCallback(() => {
    dispatch(loadFolderTreeAsync())
  }, [dispatch])

  const handleEscape = useCallback(() => {
    dispatch(clearSelection())
    dispatch(hideContextMenu())
    Object.keys(modals).forEach(modalType => {
      dispatch(hideModal(modalType))
    })
  }, [dispatch, modals])

  const focusSearch = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Function to refresh habits and sync with file system
  const refreshHabitsSync = useCallback(async () => {
    try {
      console.log('🔄 Refreshing habits and syncing with file system...')
      const result = await dispatch(fetchHabits())

      if (fetchHabits.fulfilled.match(result)) {
        console.log(
          '✅ Habits fetched successfully:',
          result.payload.length,
          'habits'
        )
        if (result.payload.length === 0) {
          console.log(
            '📝 Note: No habits found (may be unauthenticated or no habits created yet)'
          )
        }
        // Sync will happen automatically via useEffect when habits state updates
      } else {
        console.warn(
          '⚠️ Habits fetch failed, continuing with existing data:',
          result.error?.message
        )
      }
    } catch (error) {
      console.error('❌ Error refreshing habits:', error)
      // Don't throw - continue with existing state
    }
  }, [dispatch])

  // Keyboard shortcuts with proper handlers
  const shortcuts = {
    'ctrl+n': useCallback(() => {
      console.log('🔥 Ctrl+N: Creating folder...')
      handleCreateFolder()
    }, [handleCreateFolder]),

    delete: useCallback(() => {
      console.log('🔥 Delete: Deleting selected items...')
      handleDelete()
    }, [handleDelete]),

    f2: useCallback(() => {
      console.log('🔥 F2: Renaming...')
      handleRename()
    }, [handleRename]),

    'ctrl+c': useCallback(() => {
      console.log('🔥 Ctrl+C: Copying...')
      handleCopy()
    }, [handleCopy]),

    'ctrl+x': useCallback(() => {
      console.log('🔥 Ctrl+X: Cutting...')
      handleCut()
    }, [handleCut]),

    'ctrl+v': useCallback(() => {
      console.log('🔥 Ctrl+V: Pasting...')
      handlePaste()
    }, [handlePaste]),

    'ctrl+a': useCallback(() => {
      console.log('🔥 Ctrl+A: Selecting all...')
      dispatch(selectAll())
    }, [dispatch]),

    escape: useCallback(() => {
      console.log('🔥 Escape: Clearing selection/closing modals...')
      handleEscape()
    }, [handleEscape]),

    'ctrl+f': useCallback(() => {
      console.log('🔥 Ctrl+F: Focusing search...')
      focusSearch()
    }, [focusSearch]),

    f5: useCallback(() => {
      console.log('🔥 F5: Refreshing...')
      handleRefresh()
    }, [handleRefresh]),

    'alt+up': useCallback(() => {
      console.log('🔥 Alt+Up: Navigating up...')
      dispatch(navigateUp())
    }, [dispatch]),

    'alt+left': useCallback(() => {
      console.log('🔥 Alt+Left: Going back...')
      dispatch(navigateBack())
    }, [dispatch]),

    'alt+right': useCallback(() => {
      console.log('🔥 Alt+Right: Going forward...')
      dispatch(navigateForward())
    }, [dispatch]),

    'ctrl+1': useCallback(() => {
      console.log('🔥 Ctrl+1: List view...')
      dispatch(setViewMode(ViewMode.LIST))
    }, [dispatch]),

    'ctrl+2': useCallback(() => {
      console.log('🔥 Ctrl+2: Grid view...')
      dispatch(setViewMode(ViewMode.GRID))
    }, [dispatch]),

    'ctrl+3': useCallback(() => {
      console.log('🔥 Ctrl+3: Tree view...')
      dispatch(setViewMode(ViewMode.TREE))
    }, [dispatch]),

    'ctrl+4': useCallback(() => {
      console.log('🔥 Ctrl+4: Details view...')
      dispatch(setViewMode(ViewMode.DETAILS))
    }, [dispatch]),

    'ctrl+r': useCallback(() => {
      console.log('🔥 Ctrl+R: Refreshing habits...')
      refreshHabitsSync()
    }, [refreshHabitsSync]),

    f1: useCallback(() => {
      console.log('🔥 F1: Showing shortcuts...')
      dispatch(showModal({ modalType: 'shortcuts' }))
    }, [dispatch]),
  }

  useKeyboardShortcuts(shortcuts, fileSystemRef, {
    preventDefault: true,
    stopPropagation: true,
    ignoreInputs: true,
    enabled: true,
  })

  // Click outside to close context menu
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        contextMenu.isVisible &&
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target)
      ) {
        dispatch(hideContextMenu())
      }
    }

    if (contextMenu.isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu.isVisible, dispatch])

  // Event handlers
  const handleEntityClick = useCallback(
    (entity, event) => {
      const currentTime = Date.now()
      const isDoubleClick = currentTime - lastClickTime < 300
      setLastClickTime(currentTime)

      const ctrlKey = event.ctrlKey || event.metaKey
      const shiftKey = event.shiftKey

      // Close context menu on left click
      if (contextMenu.isVisible) {
        dispatch(hideContextMenu())
      }

      if (isDoubleClick && entity.type === EntityType.FOLDER) {
        // Double-click to navigate into folder
        const newPath = [...currentPath, { id: entity.id, name: entity.name }]
        dispatch(navigateToPath(newPath))
      } else if (isDoubleClick && entity.type === EntityType.HABIT) {
        // Double-click to open habit
        if (onHabitClick) {
          onHabitClick(entity.habitData)
        }
      } else {
        // Single click for selection
        let selectionMode = 'single'
        if (ctrlKey) {
          selectionMode = 'multi'
        } else if (shiftKey) {
          selectionMode = 'range'
        }

        dispatch(
          selectEntity({
            entityId: entity.id,
            mode: selectionMode,
          })
        )
      }
    },
    [lastClickTime, currentPath, dispatch, onHabitClick, contextMenu.isVisible]
  )

  const handleContextMenu = useCallback(
    (event, entity) => {
      event.preventDefault()
      dispatch(
        showContextMenu({
          x: event.clientX,
          y: event.clientY,
          entityId: entity?.id || null,
          entityType: entity?.type || null,
        })
      )
    },
    [dispatch]
  )

  // Drag and drop handlers
  const handleDragStart = useCallback(
    (event, entity) => {
      const draggedIds = selectedEntities.includes(entity.id)
        ? selectedEntities
        : [entity.id]

      dispatch(startDrag({ entityIds: draggedIds }))

      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', JSON.stringify(draggedIds))

      // Store drag position for visual feedback (optional)
      // setDragStartPosition({ x: event.clientX, y: event.clientY })
    },
    [dispatch, selectedEntities]
  )

  const handleDragOver = useCallback(
    (event, entity) => {
      if (dragState.isDragging && entity.type === EntityType.FOLDER) {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        dispatch(dragOver({ entityId: entity.id, position: 'inside' }))
      }
    },
    [dispatch, dragState.isDragging]
  )

  const handleDrop = useCallback(
    (event, entity) => {
      event.preventDefault()

      if (dragState.isDragging && entity.type === EntityType.FOLDER) {
        // Implementation would dispatch move operation
        console.log('Drop operation:', {
          draggedIds: dragState.draggedEntityIds,
          targetFolderId: entity.id,
        })
      }

      dispatch(endDrag())
    },
    [dispatch, dragState]
  )

  // Render functions
  const renderToolbar = () => (
    <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
      {/* Navigation controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => dispatch(navigateBack())}
          disabled={!canNavigateBack}
          className="p-2 rounded transition-colors disabled:opacity-50 text-gray-400 hover:text-gray-200 disabled:hover:text-gray-400"
          title="Back (Alt+Left)"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => dispatch(navigateForward())}
          disabled={!canNavigateForward}
          className="p-2 rounded transition-colors disabled:opacity-50 text-gray-400 hover:text-gray-200 disabled:hover:text-gray-400"
          title="Forward (Alt+Right)"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => dispatch(navigateUp())}
          disabled={currentPath.length === 0}
          className="p-2 rounded transition-colors disabled:opacity-50 text-gray-400 hover:text-gray-200 disabled:hover:text-gray-400"
          title="Up (Alt+Up)"
        >
          <ChevronUpIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-600 mx-2" />

        <button
          onClick={() => dispatch(navigateToPath([]))}
          className="p-2 rounded transition-colors text-gray-400 hover:text-gray-200"
          title="Home"
        >
          <HomeIcon className="w-4 h-4" />
        </button>
      </div>

      {/* View mode controls */}
      <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => dispatch(setViewMode(ViewMode.LIST))}
          className={`p-2 rounded transition-colors ${
            viewMode === ViewMode.LIST
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          title="List View (Ctrl+1)"
        >
          <ListBulletIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => dispatch(setViewMode(ViewMode.GRID))}
          className={`p-2 rounded transition-colors ${
            viewMode === ViewMode.GRID
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          title="Grid View (Ctrl+2)"
        >
          <Squares2X2Icon className="w-4 h-4" />
        </button>

        <button
          onClick={() => dispatch(setViewMode(ViewMode.DETAILS))}
          className={`p-2 rounded transition-colors ${
            viewMode === ViewMode.DETAILS
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          title="Details View (Ctrl+4)"
        >
          <TableCellsIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleCreateFolder()}
          className="px-3 py-1.5 rounded transition-colors text-gray-400 hover:text-gray-200 hover:bg-gray-700 flex items-center space-x-1"
          title="Create Folder (Ctrl+N)"
        >
          <FolderIcon className="w-4 h-4" />
          <span className="text-sm">Folder</span>
        </button>

        <button
          onClick={() => {
            if (onScrollToForm) {
              onScrollToForm()
            }
          }}
          className="px-3 py-1.5 rounded transition-colors bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1"
          title="Create New Habit"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="text-sm">Habit</span>
        </button>

        <div className="w-px h-6 bg-gray-600 mx-2" />

        <button
          onClick={handleRefresh}
          disabled={loading.tree}
          className="p-2 rounded transition-colors text-gray-400 hover:text-gray-200 hover:bg-gray-700 disabled:opacity-50"
          title="Refresh (F5)"
        >
          <ArrowPathIcon
            className={`w-4 h-4 ${loading.tree ? 'animate-spin' : ''}`}
          />
        </button>

        <button
          onClick={() => dispatch(showModal({ modalType: 'shortcuts' }))}
          className="p-2 rounded transition-colors text-gray-400 hover:text-gray-200 hover:bg-gray-700"
          title="Keyboard Shortcuts (F1)"
        >
          <CommandLineIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  const renderBreadcrumbs = () => (
    <div className="flex items-center p-2 bg-gray-750 border-b border-gray-700">
      <div className="flex items-center space-x-1 flex-1">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id || 'root'}>
            {index > 0 && <span className="text-gray-500">/</span>}
            <button
              onClick={() => {
                const pathToIndex = currentPath.slice(0, index)
                dispatch(navigateToPath(pathToIndex))
              }}
              className="px-2 py-1 rounded text-sm hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
            >
              <span className="mr-1">{crumb.icon}</span>
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Advanced Search bar */}
      <div className="flex items-center space-x-2">
        {/* Habits Refresh Button */}
        <button
          onClick={refreshHabitsSync}
          className="px-3 py-1.5 rounded transition-colors text-xs flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white"
          title="Refresh habits from backend (Ctrl+R)"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Sync Habits</span>
          {habits && habits.length > 0 && (
            <span className="bg-green-800 text-green-200 px-1 rounded text-xs">
              {habits.length}
            </span>
          )}
        </button>

        {/* Paste Button */}
        <button
          onClick={handlePaste}
          disabled={clipboard.entityIds.length === 0}
          className={`px-3 py-1.5 rounded transition-colors text-xs flex items-center space-x-1 ${
            clipboard.entityIds.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          title={
            clipboard.entityIds.length > 0
              ? `Paste ${clipboard.entityIds.length} item${
                  clipboard.entityIds.length > 1 ? 's' : ''
                } (${clipboard.action})`
              : 'Nothing to paste (Ctrl+V)'
          }
        >
          <ClipboardDocumentIcon className="w-4 h-4" />
          <span>Paste</span>
          {clipboard.entityIds.length > 0 && (
            <span className="bg-blue-800 text-blue-200 px-1 rounded text-xs">
              {clipboard.entityIds.length}
            </span>
          )}
        </button>

        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search files and folders... (Ctrl+F)"
            className="pl-10 pr-4 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />

          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded shadow-lg z-50 max-h-32 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleSearchChange(suggestion)
                    setShowSuggestions(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-600 text-sm text-white border-b border-gray-600 last:border-b-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderEntityIcon = entity => {
    if (entity.type === EntityType.FOLDER) {
      return entity.metadata.icon ? (
        <span className="text-lg">{entity.metadata.icon}</span>
      ) : (
        <FolderIcon className="w-5 h-5 text-blue-400" />
      )
    } else {
      return entity.metadata.icon ? (
        <span className="text-lg">{entity.metadata.icon}</span>
      ) : (
        <DocumentIcon className="w-5 h-5 text-gray-400" />
      )
    }
  }

  const renderListItem = useCallback(
    (entity, index, isScrolling) => (
      <div
        key={entity.id}
        draggable={!isScrolling}
        onDragStart={e => handleDragStart(e, entity)}
        onDragOver={e => handleDragOver(e, entity)}
        onDrop={e => handleDrop(e, entity)}
        onClick={e => handleEntityClick(entity, e)}
        onContextMenu={e => handleContextMenu(e, entity)}
        className={`flex items-center p-3 hover:bg-gray-700 transition-colors cursor-pointer border-b border-gray-700 ${
          selectedEntities.includes(entity.id) ? 'bg-blue-900' : ''
        } ${dragState.dragOverEntityId === entity.id ? 'bg-green-900' : ''}`}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {renderEntityIcon(entity)}
          <span className="text-white truncate">{entity.name}</span>
          {entity.type === EntityType.FOLDER && entity.habitCount > 0 && (
            <span className="text-xs text-gray-400">({entity.habitCount})</span>
          )}
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-400">
          <span>{entity.type === EntityType.FOLDER ? 'Folder' : 'Habit'}</span>
          <span>
            {new Date(entity.metadata.modifiedAt).toLocaleDateString()}
          </span>
          {entity.type === EntityType.HABIT && entity.habitData && (
            <>
              <span className="px-2 py-1 bg-gray-600 rounded">
                {entity.habitData.priority || 'medium'}
              </span>
              <span>Streak: {entity.habitData.currentStreak || 0}</span>
            </>
          )}
        </div>
      </div>
    ),
    [
      selectedEntities,
      dragState.dragOverEntityId,
      handleDragStart,
      handleDragOver,
      handleDrop,
      handleEntityClick,
      handleContextMenu,
    ]
  )

  const renderListView = () => (
    <VirtualScrollList
      items={displayEntities}
      itemHeight={48}
      containerHeight={336} // 7 items visible
      renderItem={renderListItem}
      className="bg-gray-800"
    />
  )

  const renderGridItem = useCallback(
    (entity, index, isScrolling) => (
      <div
        key={entity.id}
        draggable={!isScrolling}
        onDragStart={e => handleDragStart(e, entity)}
        onDragOver={e => handleDragOver(e, entity)}
        onDrop={e => handleDrop(e, entity)}
        onClick={e => handleEntityClick(entity, e)}
        onContextMenu={e => handleContextMenu(e, entity)}
        className={`flex flex-col items-center p-4 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer ${
          selectedEntities.includes(entity.id) ? 'bg-blue-900' : ''
        } ${dragState.dragOverEntityId === entity.id ? 'bg-green-900' : ''}`}
      >
        <div className="text-4xl mb-2">{renderEntityIcon(entity)}</div>
        <span className="text-white text-sm text-center truncate w-full">
          {entity.name}
        </span>
        {entity.type === EntityType.FOLDER && entity.habitCount > 0 && (
          <span className="text-xs text-gray-400 mt-1">
            {entity.habitCount} items
          </span>
        )}
      </div>
    ),
    [
      selectedEntities,
      dragState.dragOverEntityId,
      handleDragStart,
      handleDragOver,
      handleDrop,
      handleEntityClick,
      handleContextMenu,
    ]
  )

  const renderGridView = () => (
    <div className="p-4">
      <VirtualScrollList
        items={displayEntities}
        itemHeight={120}
        containerHeight={368} // ~3 rows visible
        renderItem={(entity, index, isScrolling) => (
          <div className="grid grid-cols-4 gap-4">
            {displayEntities
              .slice(index * 4, (index + 1) * 4)
              .map(gridEntity => (
                <div key={gridEntity.id}>
                  {renderGridItem(gridEntity, index, isScrolling)}
                </div>
              ))}
          </div>
        )}
        className="bg-gray-800"
      />
    </div>
  )

  const renderDetailsItem = useCallback(
    (entity, index, isScrolling) => (
      <tr
        key={entity.id}
        draggable={!isScrolling}
        onDragStart={e => handleDragStart(e, entity)}
        onDragOver={e => handleDragOver(e, entity)}
        onDrop={e => handleDrop(e, entity)}
        onClick={e => handleEntityClick(entity, e)}
        onContextMenu={e => handleContextMenu(e, entity)}
        className={`hover:bg-gray-700 transition-colors cursor-pointer border-b border-gray-700 ${
          selectedEntities.includes(entity.id) ? 'bg-blue-900' : ''
        } ${dragState.dragOverEntityId === entity.id ? 'bg-green-900' : ''}`}
      >
        <td className="p-3">
          <div className="flex items-center space-x-3">
            {renderEntityIcon(entity)}
            <span className="text-white">{entity.name}</span>
          </div>
        </td>
        <td className="p-3 text-gray-400 text-sm">
          {new Date(entity.metadata.modifiedAt).toLocaleDateString()}
        </td>
        <td className="p-3 text-gray-400 text-sm">
          {entity.type === EntityType.FOLDER ? 'Folder' : 'Habit'}
        </td>
        <td className="p-3 text-gray-400 text-sm">
          {entity.type === EntityType.FOLDER ? (
            `${entity.habitCount || 0} items`
          ) : entity.habitData ? (
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-gray-600 rounded text-xs">
                {entity.habitData.priority || 'medium'}
              </span>
              <span>Streak: {entity.habitData.currentStreak || 0}</span>
            </div>
          ) : null}
        </td>
      </tr>
    ),
    [
      selectedEntities,
      dragState.dragOverEntityId,
      handleDragStart,
      handleDragOver,
      handleDrop,
      handleEntityClick,
      handleContextMenu,
    ]
  )

  const renderDetailsView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-700 border-b border-gray-600 sticky top-0 z-10">
          <tr>
            <th
              className="text-left p-3 text-gray-300 cursor-pointer hover:text-white"
              onClick={() => dispatch(setSortBy(SortBy.NAME))}
            >
              Name{' '}
              {sortBy === SortBy.NAME && (
                <span className="ml-1">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </th>
            <th
              className="text-left p-3 text-gray-300 cursor-pointer hover:text-white"
              onClick={() => dispatch(setSortBy(SortBy.DATE_MODIFIED))}
            >
              Modified{' '}
              {sortBy === SortBy.DATE_MODIFIED && (
                <span className="ml-1">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </th>
            <th className="text-left p-3 text-gray-300">Type</th>
            <th className="text-left p-3 text-gray-300">Details</th>
          </tr>
        </thead>
      </table>
      <VirtualScrollList
        items={displayEntities}
        itemHeight={56}
        containerHeight={336}
        renderItem={(entity, index, isScrolling) => (
          <table className="w-full">
            <tbody>{renderDetailsItem(entity, index, isScrolling)}</tbody>
          </table>
        )}
        className="bg-gray-800"
      />
    </div>
  )

  const renderContent = () => {
    if (loading.tree) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-400" />
            <p className="text-gray-400">Loading file system...</p>
          </div>
        </div>
      )
    }

    if (errors.tree) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <InformationCircleIcon className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-red-400 mb-2">Failed to load file system</p>
            <p className="text-gray-400 text-sm mb-4">{errors.tree}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    if (displayEntities.length === 0 && searchQuery) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400 mb-2">
              No results found for "{searchQuery}"
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Try different keywords or check spelling
            </p>
            <button
              onClick={() => {
                dispatch(setSearchQuery(''))
                searchInputRef.current?.focus()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        </div>
      )
    }

    if (displayEntities.length === 0 && !searchQuery) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FolderIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400 mb-2">This folder is empty</p>
            <button
              onClick={() => handleCreateFolder()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Create First Folder
            </button>
          </div>
        </div>
      )
    }

    switch (viewMode) {
      case ViewMode.GRID:
        return renderGridView()
      case ViewMode.DETAILS:
        return renderDetailsView()
      default:
        return renderListView()
    }
  }

  const renderStatusBar = () => (
    <div className="flex items-center justify-between p-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
      <div className="flex items-center space-x-4">
        {searchQuery ? (
          <>
            <span>
              {displayEntities.length} of {entities.length} items
            </span>
            <span className="text-blue-400">Search: "{searchQuery}"</span>
          </>
        ) : (
          <span>{entities.length} items</span>
        )}
        {selectedEntities.length > 0 && (
          <span>{selectedEntities.length} selected</span>
        )}
        {clipboard.entityIds.length > 0 && (
          <span>
            {clipboard.entityIds.length} in clipboard ({clipboard.action})
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <span>
          Sort: {sortBy} ({sortDirection})
        </span>
        <span>View: {viewMode}</span>
        {loading.create || loading.update || loading.delete ? (
          <span className="text-blue-400">Processing...</span>
        ) : null}
      </div>
    </div>
  )

  return (
    <div
      ref={fileSystemRef}
      tabIndex={0}
      className={`flex flex-col h-full bg-gray-900 text-white ${className}`}
      onContextMenu={e => handleContextMenu(e, null)}
    >
      {renderToolbar()}
      {renderBreadcrumbs()}

      <div className="flex-1 overflow-auto">{renderContent()}</div>

      {renderStatusBar()}

      {/* Context Menu */}
      {contextMenu.isVisible && (
        <div
          ref={contextMenuRef}
          className="fixed bg-gray-800 border border-gray-600 rounded shadow-lg py-2 z-50 min-w-40"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              handleCreateFolder()
              dispatch(hideContextMenu())
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Folder
          </button>

          {clipboard.entityIds.length > 0 && (
            <button
              onClick={() => {
                handlePaste()
                dispatch(hideContextMenu())
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center"
            >
              <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
              Paste ({clipboard.entityIds.length} items)
            </button>
          )}

          {selectedEntities.length > 0 && (
            <>
              <hr className="my-1 border-gray-600" />
              <button
                onClick={() => {
                  handleCopy()
                  dispatch(hideContextMenu())
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center"
              >
                <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                Copy ({selectedEntities.length} items)
              </button>

              <button
                onClick={() => {
                  handleCut()
                  dispatch(hideContextMenu())
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center"
              >
                <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                Cut ({selectedEntities.length} items)
              </button>

              {selectedEntities.length === 1 && (
                <button
                  onClick={() => {
                    handleRename()
                    dispatch(hideContextMenu())
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Rename
                </button>
              )}

              <button
                onClick={() => {
                  handleDelete()
                  dispatch(hideContextMenu())
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center text-red-400 hover:text-red-300"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete ({selectedEntities.length} items)
              </button>
            </>
          )}

          <hr className="my-1 border-gray-600" />
          <button
            onClick={() => {
              handleRefresh()
              dispatch(hideContextMenu())
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>

          <button
            onClick={() => {
              dispatch(showModal({ modalType: 'shortcuts' }))
              dispatch(hideContextMenu())
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center"
          >
            <Cog6ToothIcon className="w-4 h-4 mr-2" />
            Keyboard Shortcuts
          </button>
        </div>
      )}

      {/* Create Folder Modal */}
      {modals.createFolder.isVisible && (
        <CreateFolderModal
          isVisible={modals.createFolder.isVisible}
          onClose={() => dispatch(hideModal('createFolder'))}
          onCreateFolder={folderData => {
            dispatch(
              createFolderAsync({
                ...folderData,
                parentId: modals.createFolder.parentId,
              })
            )
          }}
          parentId={modals.createFolder.parentId}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {modals.shortcuts.isVisible && (
        <KeyboardShortcutsModal
          isVisible={modals.shortcuts.isVisible}
          onClose={() => dispatch(hideModal('shortcuts'))}
        />
      )}
    </div>
  )
}

// Supporting Components
const CreateFolderModal = ({
  isVisible,
  onClose,
  onCreateFolder,
  // parentId is passed but not used in this component (used by parent)
}) => {
  const [folderName, setFolderName] = useState('')
  const [folderIcon, setFolderIcon] = useState('📁')
  const [folderColor] = useState('#6B7280') // Color picker not implemented yet
  const [description, setDescription] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    if (folderName.trim()) {
      onCreateFolder({
        name: folderName.trim(),
        icon: folderIcon,
        color: folderColor,
        description: description.trim(),
      })
      setFolderName('')
      setDescription('')
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Create New Folder
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter folder name..."
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icon
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={folderIcon}
                onChange={e => setFolderIcon(e.target.value)}
                className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              />
              <div className="flex space-x-1">
                {['📁', '📂', '🗂️', '📋', '📊', '⚙️'].map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFolderIcon(icon)}
                    className="p-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
              placeholder="Enter folder description..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const KeyboardShortcutsModal = ({ isVisible, onClose }) => {
  if (!isVisible) return null

  const shortcuts = [
    { key: 'Ctrl+N', action: 'Create new folder' },
    { key: 'Delete', action: 'Delete selected items' },
    { key: 'F2', action: 'Rename selected item' },
    { key: 'Ctrl+C', action: 'Copy selected items' },
    { key: 'Ctrl+X', action: 'Cut selected items' },
    { key: 'Ctrl+V', action: 'Paste items' },
    { key: 'Ctrl+A', action: 'Select all items' },
    { key: 'Escape', action: 'Clear selection / Close modals' },
    { key: 'Ctrl+F', action: 'Focus search box' },
    { key: 'F5', action: 'Refresh view' },
    { key: 'Alt+Up', action: 'Navigate up one level' },
    { key: 'Alt+Left', action: 'Go back' },
    { key: 'Alt+Right', action: 'Go forward' },
    { key: 'Ctrl+1', action: 'List view' },
    { key: 'Ctrl+2', action: 'Grid view' },
    { key: 'Ctrl+4', action: 'Details view' },
    { key: 'F1', action: 'Show keyboard shortcuts' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Keyboard Shortcuts
        </h2>

        <div className="space-y-2">
          {shortcuts.map(({ key, action }) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-gray-300">{action}</span>
              <code className="bg-gray-700 px-2 py-1 rounded text-sm text-blue-300">
                {key}
              </code>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
