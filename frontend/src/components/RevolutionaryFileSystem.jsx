import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  Squares2X2Icon,
  EllipsisVerticalIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

import {
  syncWithHabits,
  selectFilteredAndSortedEntities,
  selectFolderTree,
  selectViewState,
  selectSearchQuery,
  selectSelectedEntities,
  selectDragState,
  selectContextMenu,
  setSearchQuery,
  setSortBy,
  setViewMode,
  selectEntity,
  createFolderAsync,
  setContextMenu,
  hideContextMenu,
} from '../features/fileSystem/fileSystemSlice'

import { selectAllHabits } from '../features/habits/habitsSlice'

import FileSystemTreeView from './FileSystemTreeView'
import FileSystemListView from './FileSystemListView'
import FileSystemGridView from './FileSystemGridView'
import FileSystemToolbar from './FileSystemToolbar'
import FileSystemContextMenu from './FileSystemContextMenu'
import CreateFolderModal from './CreateFolderModal'
import FileDetailsPanel from './FileDetailsPanel'

/**
 * Revolutionary File System Interface - Phase 1: Core Structure
 * Implements Composite Pattern for hierarchical file/folder management
 */
export default function RevolutionaryFileSystem({
  habits: propHabits,
  onEditHabit,
  onCreateHabit,
  className = '',
}) {
  const dispatch = useDispatch()

  // Redux state
  const reduxHabits = useSelector(selectAllHabits)
  const habits = useMemo(
    () => propHabits || reduxHabits || [],
    [propHabits, reduxHabits]
  )
  const entities = useSelector(selectFilteredAndSortedEntities)
  const folderTree = useSelector(selectFolderTree)
  const viewState = useSelector(selectViewState)
  const searchQuery = useSelector(selectSearchQuery)
  const selectedEntities = useSelector(selectSelectedEntities)
  const dragState = useSelector(selectDragState)
  const contextMenu = useSelector(selectContextMenu)

  // Local state
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showFileDetails, setShowFileDetails] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Sync habits with file system entities on mount and habit changes
  useEffect(() => {
    if (habits && habits.length > 0) {
      dispatch(syncWithHabits(habits))
      setIsInitialized(true)
    } else if (habits && habits.length === 0) {
      // Even with no habits, mark as initialized so UI can render
      setIsInitialized(true)
    }
  }, [habits, dispatch])

  // Handle file system operations
  const handleCreateNewHabit = useCallback(() => {
    if (onCreateHabit) {
      onCreateHabit()
    }

    // Scroll to form after delay
    setTimeout(() => {
      const formElement =
        document.getElementById('habit-creation-form') ||
        document.querySelector('[data-testid="add-habit-form"]')
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        formElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50')
        setTimeout(() => {
          formElement.classList.remove(
            'ring-2',
            'ring-blue-500',
            'ring-opacity-50'
          )
        }, 2000)
      }
    }, 100)
  }, [onCreateHabit])

  const handleCreateFolder = useCallback(
    async (name, parentId = null) => {
      try {
        await dispatch(createFolderAsync({ name, parent: parentId }))
        setShowCreateFolder(false)
      } catch (error) {
        console.error('Failed to create folder:', error)
      }
    },
    [dispatch]
  )

  const handleFileSelect = useCallback(
    (entityId, multiSelect = false) => {
      dispatch(selectEntity({ id: entityId, multiSelect }))

      // If it's a habit file, trigger edit
      const entity = entities.find(e => e.id === entityId)
      if (entity && entity.type === 'file' && entity.habitData) {
        if (onEditHabit) {
          onEditHabit(entity.habitData)
        }
      }
    },
    [dispatch, entities, onEditHabit]
  )

  const handleFileDoubleClick = useCallback(
    entityId => {
      const entity = entities.find(e => e.id === entityId)
      if (entity && entity.type === 'file' && entity.habitData) {
        setSelectedFile(entity)
        setShowFileDetails(true)
      }
    },
    [entities]
  )

  const handleSearch = useCallback(
    query => {
      dispatch(setSearchQuery(query))
    },
    [dispatch]
  )

  const handleSortChange = useCallback(
    sortBy => {
      dispatch(setSortBy(sortBy))
    },
    [dispatch]
  )

  const handleViewModeChange = useCallback(
    viewMode => {
      dispatch(setViewMode(viewMode))
    },
    [dispatch]
  )

  const handleContextMenu = useCallback(
    (event, entityId) => {
      event.preventDefault()
      dispatch(
        setContextMenu({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          target: entityId,
        })
      )
    },
    [dispatch]
  )

  const handleCloseContextMenu = useCallback(() => {
    dispatch(hideContextMenu())
  }, [dispatch])

  // Get current view component
  const getCurrentViewComponent = useMemo(() => {
    switch (viewState.viewMode) {
      case 'tree':
        return FileSystemTreeView
      case 'grid':
        return FileSystemGridView
      case 'list':
      default:
        return FileSystemListView
    }
  }, [viewState.viewMode])

  const CurrentViewComponent = getCurrentViewComponent

  // Loading state
  if (!isInitialized) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-gray-600">Initializing File System...</span>
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}
    >
      {/* File System Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <FolderIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            Revolutionary File System
          </h2>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {entities.length} items
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateFolder(true)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Create Folder"
          >
            <FolderIcon className="w-5 h-5" />
          </button>

          <button
            onClick={handleCreateNewHabit}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Create New Habit File"
          >
            <PlusIcon className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300" />

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { mode: 'list', icon: Bars3Icon, title: 'List View' },
              { mode: 'grid', icon: Squares2X2Icon, title: 'Grid View' },
              { mode: 'tree', icon: ChevronRightIcon, title: 'Tree View' },
            ].map(({ mode, icon: IconComponent, title }) => (
              <button
                key={mode}
                onClick={() => handleViewModeChange(mode)}
                className={`p-2 rounded ${
                  viewState.viewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title={title}
              >
                <IconComponent className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* File System Toolbar */}
      <FileSystemToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        viewState={viewState}
        onSortChange={handleSortChange}
        entities={entities}
      />

      {/* File System Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewState.viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-64"
          >
            <CurrentViewComponent
              entities={viewState.viewMode === 'tree' ? folderTree : entities}
              selectedEntities={selectedEntities}
              dragState={dragState}
              onFileSelect={handleFileSelect}
              onFileDoubleClick={handleFileDoubleClick}
              onContextMenu={handleContextMenu}
              onCreateHabit={handleCreateNewHabit}
            />
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {entities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-gray-500"
          >
            <FolderIcon className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Files or Folders
            </h3>
            <p className="text-sm text-center max-w-md mb-6">
              Create your first habit file or organize them into folders for
              better management.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleCreateNewHabit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <DocumentIcon className="w-4 h-4 mr-2" />
                Create Habit File
              </button>
              <button
                onClick={() => setShowCreateFolder(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <FolderIcon className="w-4 h-4 mr-2" />
                Create Folder
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <FileSystemContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          target={contextMenu.target}
          onClose={handleCloseContextMenu}
          entities={entities}
          onCreateFolder={() => setShowCreateFolder(true)}
          onCreateHabit={handleCreateNewHabit}
        />
      )}

      {/* Create Folder Modal */}
      <AnimatePresence>
        {showCreateFolder && (
          <CreateFolderModal
            onClose={() => setShowCreateFolder(false)}
            onCreateFolder={handleCreateFolder}
          />
        )}
      </AnimatePresence>

      {/* File Details Panel */}
      <AnimatePresence>
        {showFileDetails && selectedFile && (
          <FileDetailsPanel
            file={selectedFile}
            onClose={() => {
              setShowFileDetails(false)
              setSelectedFile(null)
            }}
            onEdit={() => {
              if (selectedFile.habitData && onEditHabit) {
                onEditHabit(selectedFile.habitData)
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Performance optimization: Memoize static components
export const MemoizedRevolutionaryFileSystem = React.memo(
  RevolutionaryFileSystem
)
