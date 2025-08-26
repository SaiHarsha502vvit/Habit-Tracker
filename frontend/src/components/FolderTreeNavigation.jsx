import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchFolderTree,
  fetchHabitsByFolder,
  fetchUncategorizedHabits,
  setSelectedFolder,
  setActiveView,
  selectFolderTree,
  selectSelectedFolder
} from '../features/search/searchSlice'

/**
 * Folder Tree Navigation Component
 * Displays hierarchical folder structure for habit organization
 */
export default function FolderTreeNavigation({ className = '' }) {
  const dispatch = useDispatch()
  const folderTree = useSelector(selectFolderTree)
  const selectedFolder = useSelector(selectSelectedFolder)
  
  const [expandedFolders, setExpandedFolders] = useState(new Set())

  useEffect(() => {
    dispatch(fetchFolderTree())
  }, [dispatch])

  const toggleFolderExpansion = (folderId) => {
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

  const handleFolderClick = (folder) => {
    dispatch(setSelectedFolder(folder.id))
    dispatch(setActiveView('folder'))
    dispatch(fetchHabitsByFolder(folder.id))
  }

  const handleShowAll = () => {
    dispatch(setSelectedFolder(null))
    dispatch(setActiveView('all'))
  }

  const handleShowUncategorized = () => {
    dispatch(setSelectedFolder(null))
    dispatch(setActiveView('uncategorized'))
    dispatch(fetchUncategorizedHabits())
  }

  const renderFolder = (folder, depth = 0) => {
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolder === folder.id

    return (
      <div key={folder.id} className="w-full">
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-200'
          }`}
          style={{ paddingLeft: `${(depth * 16) + 8}px` }}
          onClick={() => handleFolderClick(folder)}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFolderExpansion(folder.id)
              }}
              className="flex-shrink-0 p-1 hover:bg-gray-600 rounded"
            >
              <svg 
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <div className="w-5 h-5 flex-shrink-0" /> // Spacer for alignment
          )}

          {/* Folder Icon */}
          <span className="text-lg flex-shrink-0">{folder.icon || '📁'}</span>

          {/* Folder Name */}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{folder.name}</div>
            {folder.habitCount > 0 && (
              <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                {folder.habitCount} habit{folder.habitCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* System Folder Indicator */}
          {folder.isSystemFolder && (
            <div className={`text-xs px-2 py-1 rounded ${
              isSelected ? 'bg-blue-700 text-blue-100' : 'bg-gray-600 text-gray-300'
            }`}>
              Auto
            </div>
          )}
        </div>

        {/* Child Folders */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {folder.children.map(childFolder => 
              renderFolder(childFolder, depth + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Organize Habits</h3>

        {/* Quick Navigation */}
        <div className="space-y-2 mb-4">
          <button
            onClick={handleShowAll}
            className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              !selectedFolder && 'all' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-200'
            }`}
          >
            <span className="text-lg">📋</span>
            <span className="font-medium">All Habits</span>
          </button>

          <button
            onClick={handleShowUncategorized}
            className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              !selectedFolder && 'uncategorized' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-200'
            }`}
          >
            <span className="text-lg">📁</span>
            <span className="font-medium">Uncategorized</span>
          </button>
        </div>
      </div>

      {/* Folder Tree */}
      <div className="p-4">
        {folderTree.length > 0 ? (
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-400 mb-2">Folders</div>
            {folderTree.map(folder => renderFolder(folder))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-sm">No folders yet</p>
            <p className="text-xs mt-1">Create folders to organize your habits</p>
          </div>
        )}

        {/* Create Folder Button */}
        <button className="w-full mt-4 p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">Create New Folder</span>
          </div>
        </button>
      </div>

      {/* Smart Folders Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-sm font-medium text-gray-400 mb-2">Smart Folders</div>
        <div className="space-y-1">
          <button className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 text-gray-200 transition-colors">
            <span className="text-lg">🔥</span>
            <span>High Priority</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 text-gray-200 transition-colors">
            <span className="text-lg">📅</span>
            <span>Today's Focus</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 text-gray-200 transition-colors">
            <span className="text-lg">📈</span>
            <span>Active Streaks</span>
          </button>
        </div>
      </div>
    </div>
  )
}