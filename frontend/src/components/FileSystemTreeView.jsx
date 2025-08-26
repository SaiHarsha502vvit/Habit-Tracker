import React from 'react'
import { motion } from 'framer-motion'
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TagIcon,
} from '@heroicons/react/24/outline'

/**
 * Tree View Component for Revolutionary File System
 * Implements hierarchical folder/file display
 */
export default function FileSystemTreeView({
  entities,
  selectedEntities,
  onFileSelect,
  onFileDoubleClick,
  onContextMenu,
}) {
  const TreeNode = ({ entity, level = 0 }) => {
    const isFolder = entity.type === 'folder'
    const isExpanded = entity.isExpanded !== false
    const hasChildren = entity.children && entity.children.length > 0

    const getPriorityIndicator = priority => {
      switch (priority) {
        case 'high':
          return 'bg-red-500'
        case 'medium':
          return 'bg-yellow-500'
        case 'low':
          return 'bg-green-500'
        default:
          return 'bg-gray-400'
      }
    }

    return (
      <div key={entity.id}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer group transition-colors ${
            selectedEntities.includes(entity.id)
              ? 'bg-blue-50 border-r-4 border-blue-500'
              : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => onFileSelect(entity.id)}
          onDoubleClick={() => onFileDoubleClick(entity.id)}
          onContextMenu={e => onContextMenu(e, entity.id)}
        >
          {/* Expand/Collapse Icon */}
          <div className="w-4 h-4 flex items-center justify-center mr-1">
            {isFolder && hasChildren && (
              <button className="p-0.5 hover:bg-gray-200 rounded">
                {isExpanded ? (
                  <ChevronDownIcon className="w-3 h-3 text-gray-600" />
                ) : (
                  <ChevronRightIcon className="w-3 h-3 text-gray-600" />
                )}
              </button>
            )}
          </div>

          {/* File/Folder Icon */}
          <div className="mr-2 relative">
            {isFolder ? (
              isExpanded ? (
                <FolderOpenIcon className="w-4 h-4 text-blue-500" />
              ) : (
                <FolderIcon className="w-4 h-4 text-blue-500" />
              )
            ) : (
              <>
                <DocumentIcon className="w-4 h-4 text-gray-600" />
                {entity.metadata?.priority && (
                  <div
                    className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${getPriorityIndicator(
                      entity.metadata.priority
                    )}`}
                  />
                )}
              </>
            )}
          </div>

          {/* Name and Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-900 truncate">
                {entity.name}
              </span>

              {/* Metadata Badges */}
              {entity.metadata && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {entity.metadata.streak !== undefined && (
                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                      {entity.metadata.streak}d
                    </span>
                  )}

                  {entity.metadata.tags && entity.metadata.tags.length > 0 && (
                    <div className="flex items-center space-x-0.5">
                      <TagIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {entity.metadata.tags.length}
                      </span>
                    </div>
                  )}

                  {entity.metadata.completionRate !== undefined && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                      {entity.metadata.completionRate}%
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Category/Type */}
            {(entity.metadata?.category || !isFolder) && (
              <div className="text-xs text-gray-500 mt-0.5">
                {entity.metadata?.category || 'Habit File'}
              </div>
            )}
          </div>

          {/* File Size */}
          {entity.size && (
            <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {formatFileSize(entity.size)}
            </div>
          )}
        </motion.div>

        {/* Children */}
        {isFolder && isExpanded && hasChildren && (
          <div>
            {entity.children.map(child => (
              <TreeNode key={child.id} entity={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const formatFileSize = size => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="py-2">
      {entities.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <DocumentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p>No files or folders to display</p>
        </div>
      ) : (
        entities.map(entity => <TreeNode key={entity.id} entity={entity} />)
      )}
    </div>
  )
}
