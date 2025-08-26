import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  // DndProvider, 
  // useDrag, 
  // useDrop,
  // HTML5Backend 
} from 'react-dnd'

/**
 * HabitFileSystem - A revolutionary file-system-like interface for habit organization
 * 
 * 🎯 CONCEPT: Each habit is treated as a "file" with rich metadata
 * 📁 ORGANIZATION: Dynamic folders based on category, priority, tags
 * 🔍 SEARCH: Metadata-driven search with filters
 * 🖱️ INTERACTION: Drag & drop for organization
 * 
 * METADATA STRUCTURE:
 * - 📄 Filename: Habit name
 * - 🏷️ Extension: Habit type (.standard, .timed)
 * - 📊 Size: Streak count
 * - 📅 Created: Creation date
 * - 🎯 Priority: File priority (High, Medium, Low)
 * - 🗂️ Category: Folder classification
 * - 🏷️ Tags: File tags for filtering
 * - ⭐ Status: Active, Completed, Paused
 */

// File types based on habit types
const FILE_EXTENSIONS = {
  STANDARD: '.habit',
  TIMED: '.timer'
}

// Priority icons and colors
const PRIORITY_METADATA = {
  HIGH: { icon: '🔴', color: '#ef4444', label: 'High Priority' },
  MEDIUM: { icon: '🟡', color: '#f59e0b', label: 'Medium Priority' },
  LOW: { icon: '🟢', color: '#10b981', label: 'Low Priority' }
}

// File status indicators
const FILE_STATUS = {
  ACTIVE: { icon: '✅', color: '#10b981', label: 'Active' },
  PAUSED: { icon: '⏸️', color: '#f59e0b', label: 'Paused' },
  COMPLETED: { icon: '🎉', color: '#8b5cf6', label: 'Completed' }
}

// Folder structure types
const FOLDER_TYPES = {
  CATEGORY: 'category',
  PRIORITY: 'priority',
  TAG: 'tag',
  STATUS: 'status',
  DATE: 'date'
}

/**
 * HabitFile Component - Represents a single habit as a file
 */
const HabitFile = ({ habit, onOpen, onContextMenu, selected, onSelect }) => {
  // const [{ isDragging }, drag] = useDrag(() => ({
  //   type: 'habit-file',
  //   item: { id: habit.id, habit },
  //   collect: (monitor) => ({
  //     isDragging: monitor.isDragging(),
  //   }),
  // }))

  const isDragging = false // Placeholder until drag-drop is implemented

  const extension = FILE_EXTENSIONS[habit.habitType] || '.habit'
  const priorityMeta = PRIORITY_METADATA[habit.priority] || PRIORITY_METADATA.LOW
  const statusMeta = FILE_STATUS[habit.status || 'ACTIVE']

  const fileSize = `${habit.streakCount || 0} days`
  const lastModified = new Date(habit.updatedAt || habit.createdAt).toLocaleDateString()

  return (
    <motion.div
      // ref={drag}
      className={`
        flex items-center p-3 rounded-lg cursor-pointer border-2 transition-all
        ${selected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
        }
        ${isDragging ? 'opacity-50 transform scale-95' : ''}
      `}
      onClick={() => onSelect(habit.id)}
      onDoubleClick={() => onOpen(habit)}
      onContextMenu={(e) => onContextMenu(e, habit)}
      whileHover={{ y: -2, shadow: '0 8px 25px rgba(0,0,0,0.15)' }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* File Icon */}
      <div className="flex-shrink-0 mr-3">
        <div className="relative">
          <div className="w-10 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md flex items-center justify-center">
            <span className="text-white text-lg font-bold">
              {habit.habitType === 'TIMED' ? '⏱️' : '📋'}
            </span>
          </div>
          {/* Priority badge */}
          <div 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs"
            style={{ backgroundColor: priorityMeta.color }}
            title={priorityMeta.label}
          >
            {priorityMeta.icon}
          </div>
        </div>
      </div>

      {/* File Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {habit.name}{extension}
          </h3>
          <span className="ml-2 text-xs text-gray-500">
            {statusMeta.icon}
          </span>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 space-x-4">
          <span>📊 {fileSize}</span>
          <span>📅 {lastModified}</span>
          <span>🗂️ {habit.category?.name || 'Uncategorized'}</span>
        </div>

        {/* Tags */}
        {habit.tags && habit.tags.length > 0 && (
          <div className="flex flex-wrap mt-2 gap-1">
            {habit.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full"
              >
                🏷️ {tag}
              </span>
            ))}
            {habit.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{habit.tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* File Actions */}
      <div className="flex-shrink-0 ml-3">
        <button 
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          onClick={(e) => {
            e.stopPropagation()
            onContextMenu(e, habit)
          }}
        >
          ⋮
        </button>
      </div>
    </motion.div>
  )
}

/**
 * FolderView Component - Represents organizational folders
 */
const FolderView = ({ folder, habits, onFolderClick, expanded }) => {
  // const [{ isOver }, drop] = useDrop(() => ({
  //   accept: 'habit-file',
  //   drop: (item) => onDrop(item, folder),
  //   collect: (monitor) => ({
  //     isOver: monitor.isOver(),
  //   }),
  // }))

  const isOver = false // Placeholder until drag-drop is implemented
  const habitCount = habits.length

  return (
    <motion.div
      // ref={drop}
      className={`
        flex items-center p-3 rounded-lg cursor-pointer border-2 transition-all
        ${expanded 
          ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
        }
        ${isOver ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : ''}
      `}
      onClick={() => onFolderClick(folder)}
      whileHover={{ x: 4 }}
      layout
    >
      <div className="flex-shrink-0 mr-3">
        <span className="text-2xl">
          {expanded ? '📂' : '📁'}
        </span>
      </div>
      
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {folder.name}
        </h3>
        <p className="text-xs text-gray-500">
          {habitCount} item{habitCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-shrink-0">
        <span className="text-gray-400">
          {expanded ? '▼' : '▶'}
        </span>
      </div>
    </motion.div>
  )
}

/**
 * MetadataPanel - Shows detailed file information
 */
const MetadataPanel = ({ habit, onClose, onEdit }) => {
  if (!habit) return null

  const extension = FILE_EXTENSIONS[habit.habitType] || '.habit'
  const priorityMeta = PRIORITY_METADATA[habit.priority] || PRIORITY_METADATA.LOW
  const statusMeta = FILE_STATUS[habit.status || 'ACTIVE']
  const fileSize = `${habit.streakCount || 0} days streak`
  const created = new Date(habit.createdAt).toLocaleString()
  const modified = new Date(habit.updatedAt || habit.createdAt).toLocaleString()

  return (
    <motion.div
      className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-50"
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <div className="p-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            File Properties
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* File Icon and Name */}
        <div className="text-center mb-6">
          <div className="w-16 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg mx-auto mb-3 flex items-center justify-center relative">
            <span className="text-white text-2xl">
              {habit.habitType === 'TIMED' ? '⏱️' : '📋'}
            </span>
            <div 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: priorityMeta.color }}
              title={priorityMeta.label}
            >
              {priorityMeta.icon}
            </div>
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white text-sm break-all">
            {habit.name}{extension}
          </h3>
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">General</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span>{habit.habitType === 'TIMED' ? 'Timer Habit' : 'Standard Habit'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Size:</span>
                <span>{fileSize}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                <span className="flex items-center">
                  <span className="mr-1">{priorityMeta.icon}</span>
                  {priorityMeta.label}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="flex items-center">
                  <span className="mr-1">{statusMeta.icon}</span>
                  {statusMeta.label}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Location</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Folder:</span>
                <span>🗂️ {habit.category?.name || 'Uncategorized'}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Timestamps</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <span className="text-right">{created}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Modified:</span>
                <span className="text-right">{modified}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {habit.tags && habit.tags.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {habit.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                  >
                    🏷️ {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {habit.description && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Description</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {habit.description}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 pt-4 border-t">
          <button 
            onClick={() => onEdit(habit)}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            ✏️ Edit Properties
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Main HabitFileSystem Component
 */
export default function HabitFileSystem({ habits: propHabits, onEditHabit, onCreateHabit }) {
  // Local state
  // const [viewMode, setViewMode] = useState('list') // 'list', 'grid', 'details'
  const [sortBy, setSortBy] = useState('name') // 'name', 'date', 'priority', 'streak'
  const [groupBy, setGroupBy] = useState('none') // 'none', 'category', 'priority', 'status', 'tags'
  const [selectedFiles, setSelectedFiles] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  // const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)

  // Get habits from props or Redux
  const reduxHabits = useSelector(state => state.habits?.habits || [])
  const habits = propHabits || reduxHabits

  // Filter and sort habits
  const filteredHabits = useMemo(() => {
    let filtered = habits.filter(habit => 
      habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (habit.description && habit.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (habit.tags && habit.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (habit.category?.name && habit.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Sort habits
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'priority': {
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
          return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1)
        }
        case 'streak':
          return (b.streakCount || 0) - (a.streakCount || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [habits, searchQuery, sortBy])

  // Group habits by the selected criteria
  const groupedHabits = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Files': filteredHabits }
    }

    const groups = {}
    
    filteredHabits.forEach(habit => {
      let groupKey
      
      switch (groupBy) {
        case 'category':
          groupKey = habit.category?.name || 'Uncategorized'
          break
        case 'priority':
          groupKey = habit.priority || 'Low Priority'
          break
        case 'status':
          groupKey = habit.status || 'Active'
          break
        case 'tags':
          if (habit.tags && habit.tags.length > 0) {
            habit.tags.forEach(tag => {
              if (!groups[tag]) groups[tag] = []
              groups[tag].push(habit)
            })
            return
          } else {
            groupKey = 'Untagged'
          }
          break
        default:
          groupKey = 'All Files'
      }
      
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(habit)
    })

    return groups
  }, [filteredHabits, groupBy])

  // Handle file selection
  const handleFileSelect = (habitId) => {
    setSelectedFiles(prev => {
      if (prev.includes(habitId)) {
        return prev.filter(id => id !== habitId)
      } else {
        return [...prev, habitId]
      }
    })
  }

  // Handle file opening (double-click)
  const handleFileOpen = (habit) => {
    setSelectedHabit(habit)
  }

  // Handle context menu
  const handleContextMenu = (e, habit) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      habit
    })
  }

  // Handle drag and drop (TODO: Implement when drag-drop library is added)
  // const handleDrop = (item, folder) => {
  //   console.log('Moving habit', item.habit.name, 'to folder', folder.name)
  //   // TODO: Implement actual move functionality
  // }

  return (
    // TODO: Add DndProvider when drag-drop is implemented
    // <DndProvider backend={HTML5Backend}>
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-4">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
            >
              <option value="none">📄 No Grouping</option>
              <option value="category">🗂️ By Category</option>
              <option value="priority">🎯 By Priority</option>
              <option value="status">📊 By Status</option>
              <option value="tags">🏷️ By Tags</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
            >
              <option value="name">📝 Name</option>
              <option value="date">📅 Date</option>
              <option value="priority">🎯 Priority</option>
              <option value="streak">📊 Streak</option>
            </select>

            <button
              onClick={onCreateHabit}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>New File</span>
            </button>
          </div>
        </div>

        {/* File Browser */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            <AnimatePresence>
              {Object.entries(groupedHabits).map(([groupName, groupHabits]) => (
                <motion.div
                  key={groupName}
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Group Header */}
                  {groupBy !== 'none' && (
                    <div className="flex items-center mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {groupName}
                      </h2>
                      <span className="ml-2 text-sm text-gray-500">
                        ({groupHabits.length} file{groupHabits.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}

                  {/* Files */}
                  <div className="space-y-2">
                    {groupHabits.map((habit) => (
                      <HabitFile
                        key={habit.id}
                        habit={habit}
                        onOpen={handleFileOpen}
                        onContextMenu={handleContextMenu}
                        selected={selectedFiles.includes(habit.id)}
                        onSelect={handleFileSelect}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty State */}
            {filteredHabits.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No files found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery ? 'Try adjusting your search criteria.' : 'Create your first habit file to get started.'}
                </p>
                <button
                  onClick={onCreateHabit}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  ➕ Create New File
                </button>
              </motion.div>
            )}
          </div>

          {/* Metadata Panel */}
          <AnimatePresence>
            {selectedHabit && (
              <MetadataPanel
                habit={selectedHabit}
                onClose={() => setSelectedHabit(null)}
                onEdit={onEditHabit}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <span>
              {filteredHabits.length} file{filteredHabits.length !== 1 ? 's' : ''}
              {selectedFiles.length > 0 && ` • ${selectedFiles.length} selected`}
            </span>
            <span>
              🗂️ Habit File System v2.0
            </span>
          </div>
        </div>

        {/* Context Menu */}
        <AnimatePresence>
          {contextMenu && (
            <React.Fragment>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setContextMenu(null)}
              />
              <motion.div
                className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-2"
                style={{ 
                  left: contextMenu.x, 
                  top: contextMenu.y 
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <button
                  onClick={() => {
                    handleFileOpen(contextMenu.habit)
                    setContextMenu(null)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3"
                >
                  <span>📄</span>
                  <span>Open</span>
                </button>
                <button
                  onClick={() => {
                    onEditHabit(contextMenu.habit)
                    setContextMenu(null)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3"
                >
                  <span>✏️</span>
                  <span>Edit Properties</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedHabit(contextMenu.habit)
                    setContextMenu(null)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3"
                >
                  <span>ℹ️</span>
                  <span>Show Properties</span>
                </button>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
