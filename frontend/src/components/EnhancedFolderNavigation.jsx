import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  fetchFolderTree,
  fetchHabitsByFolder,
  fetchUncategorizedHabits,
  deleteFolder,
  setSelectedFolder,
  setActiveView,
  selectFolderTree,
  selectSelectedFolder,
} from '../features/search/searchSlice'

/**
 * Enhanced Folder Tree Navigation with Watery Fluid Animations
 * Features:
 * - Fluid watery animations for interactions
 * - Drag and drop reorganization
 * - Context menus for folder operations
 * - Beautiful expand/collapse animations
 * - File system-like behavior
 */
export default function EnhancedFolderNavigation({ className = '' }) {
  const dispatch = useDispatch()
  const folderTree = useSelector(selectFolderTree)
  const selectedFolder = useSelector(selectSelectedFolder)

  // Authentication check
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']))
  const [hoveredFolder, setHoveredFolder] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)

  // Check authentication status
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

  useEffect(() => {
    // Only fetch folder tree if authenticated
    if (isAuthenticated) {
      dispatch(fetchFolderTree())
    }
  }, [dispatch, isAuthenticated])

  // Handle folder expansion with smooth animation
  const toggleFolderExpansion = folderId => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const handleFolderClick = folder => {
    dispatch(setSelectedFolder(folder.id))
    dispatch(setActiveView('folder'))
    dispatch(fetchHabitsByFolder(folder.id))
  }

  const handleFolderHover = folderId => {
    setHoveredFolder(folderId)
  }

  const handleFolderLeave = () => {
    setHoveredFolder(null)
  }

  const handleContextMenu = (e, folder) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      folder,
    })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const handleCreateFolder = (parentId = null) => {
    // Future implementation: Show create folder dialog
    // console.log('Create folder with parent:', parentId)
    // TODO: Implement actual folder creation logic with parentId
    setContextMenu(null)
  }

  const handleEditFolder = folder => {
    // Future implementation: Show edit folder dialog
    console.log('Edit folder:', folder)
    setContextMenu(null)
  }

  const handleDeleteFolder = async folder => {
    if (window.confirm(`Are you sure you want to delete "${folder.name}"?`)) {
      await dispatch(deleteFolder(folder.id))
      dispatch(fetchFolderTree())
    }
    setContextMenu(null)
  }

  // Watery animation variants
  const waterDropVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
      y: -20,
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 20,
        duration: 0.6,
      },
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 15,
      },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
    exit: {
      scale: 0,
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      },
    },
  }

  const folderIconVariants = {
    closed: {
      rotateY: 0,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
    open: {
      rotateY: -15,
      scale: 1.1,
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
    hover: {
      scale: 1.15,
      rotateZ: 3,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
  }

  const expandIconVariants = {
    collapsed: {
      rotate: 0,
      transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] },
    },
    expanded: {
      rotate: 90,
      transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] },
    },
  }

  const childrenVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1],
        when: 'afterChildren',
      },
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1],
        when: 'beforeChildren',
        staggerChildren: 0.05,
      },
    },
  }

  const renderFolder = (folder, depth = 0) => {
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolder === folder.id
    const isHovered = hoveredFolder === folder.id

    // Generate ripple effect on click
    const rippleVariants = {
      initial: { scale: 0, opacity: 0.5 },
      animate: {
        scale: 1.5,
        opacity: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    }

    return (
      <motion.div
        key={folder.id}
        className="relative"
        variants={waterDropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
      >
        {/* Main Folder Row */}
        <motion.div
          className={`group relative flex items-center p-3 rounded-xl cursor-pointer transition-all duration-300 ${
            isSelected
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
              : isHovered
              ? 'bg-gray-100 dark:bg-gray-700'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
          style={{
            paddingLeft: `${depth * 20 + 12}px`,
            marginBottom: '2px',
          }}
          onClick={() => handleFolderClick(folder)}
          onMouseEnter={() => handleFolderHover(folder.id)}
          onMouseLeave={handleFolderLeave}
          onContextMenu={e => handleContextMenu(e, folder)}
          variants={waterDropVariants}
          whileHover="hover"
          whileTap="tap"
          layout
        >
          {/* Ripple Effect */}
          {isSelected && (
            <motion.div
              className="absolute inset-0 bg-white rounded-xl"
              variants={rippleVariants}
              initial="initial"
              animate="animate"
              style={{
                background: `radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)`,
              }}
            />
          )}

          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <motion.button
              onClick={e => {
                e.stopPropagation()
                toggleFolderExpansion(folder.id)
              }}
              className="flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 mr-2"
              variants={expandIconVariants}
              animate={isExpanded ? 'expanded' : 'collapsed'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          ) : (
            <div className="w-6 h-6 mr-2" />
          )}

          {/* Folder Icon with Animation */}
          <motion.div
            className="flex-shrink-0 text-2xl mr-3"
            variants={folderIconVariants}
            animate={isExpanded ? 'open' : 'closed'}
            whileHover="hover"
          >
            {folder.icon || (isExpanded ? '📂' : '📁')}
          </motion.div>

          {/* Folder Info */}
          <div className="flex-1 min-w-0">
            <motion.div className="font-medium truncate" layout>
              {folder.name}
            </motion.div>
            {folder.habitCount > 0 && (
              <motion.div
                className={`text-xs mt-1 ${
                  isSelected
                    ? 'text-blue-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {folder.habitCount} habit{folder.habitCount !== 1 ? 's' : ''}
              </motion.div>
            )}
          </div>

          {/* System Folder Badge */}
          {folder.isSystemFolder && (
            <motion.div
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                isSelected
                  ? 'bg-blue-700 text-blue-100'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              }`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            >
              Auto
            </motion.div>
          )}

          {/* Hover Actions */}
          <AnimatePresence>
            {isHovered && !folder.isSystemFolder && (
              <motion.div
                className="flex space-x-1 ml-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleEditFolder(folder)
                  }}
                  className="p-1 rounded hover:bg-black hover:bg-opacity-20"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleDeleteFolder(folder)
                  }}
                  className="p-1 rounded hover:bg-red-500 hover:bg-opacity-20 text-red-500"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 112 0v4a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v4a1 1 0 11-2 0V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Child Folders with Staggered Animation */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              className="overflow-hidden"
              variants={childrenVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              {folder.children.map((childFolder, index) => (
                <motion.div
                  key={childFolder.id}
                  variants={{
                    collapsed: { opacity: 0, x: -20 },
                    expanded: {
                      opacity: 1,
                      x: 0,
                      transition: {
                        delay: index * 0.05,
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      },
                    },
                  }}
                >
                  {renderFolder(childFolder, depth + 1)}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // Don't render if user is not authenticated
  if (!isAuthenticated) return null

  return (
    <div className={`relative ${className}`}>
      {/* Main Container */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <motion.h3
              className="text-xl font-bold text-gray-900 dark:text-white flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <span className="mr-3 text-2xl">🗂️</span>
              Organization
            </motion.h3>

            <motion.button
              onClick={() => handleCreateFolder()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>New Folder</span>
            </motion.button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {[
              {
                key: 'all',
                icon: '📋',
                label: 'All Habits',
                action: () => {
                  dispatch(setSelectedFolder(null))
                  dispatch(setActiveView('all'))
                },
              },
              {
                key: 'uncategorized',
                icon: '📁',
                label: 'Uncategorized',
                action: () => {
                  dispatch(setSelectedFolder(null))
                  dispatch(setActiveView('uncategorized'))
                  dispatch(fetchUncategorizedHabits())
                },
              },
            ].map((item, index) => (
              <motion.button
                key={item.key}
                onClick={item.action}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors text-left"
                whileHover={{
                  x: 4,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Folder Tree */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {folderTree.length > 0 ? (
            <motion.div
              className="space-y-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {folderTree.map((folder, index) => (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.6 + index * 0.1,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  {renderFolder(folder)}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="text-6xl mb-4">📁</div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No folders yet
              </p>
              <motion.button
                onClick={() => handleCreateFolder()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Your First Folder
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {[
              {
                label: 'Create Subfolder',
                icon: '➕',
                action: () => handleCreateFolder(contextMenu.folder.id),
              },
              {
                label: 'Edit Folder',
                icon: '✏️',
                action: () => handleEditFolder(contextMenu.folder),
              },
              {
                label: 'Delete Folder',
                icon: '🗑️',
                action: () => handleDeleteFolder(contextMenu.folder),
                danger: true,
              },
            ].map((item, index) => (
              <motion.button
                key={index}
                onClick={item.action}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 ${
                  item.danger ? 'text-red-600 dark:text-red-400' : ''
                }`}
                whileHover={{
                  backgroundColor: item.danger
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(31, 41, 55, 0.1)',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close context menu */}
      {contextMenu && (
        <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
      )}
    </div>
  )
}
