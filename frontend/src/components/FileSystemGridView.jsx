import React from 'react'
import { motion } from 'framer-motion'
import {
  FolderIcon,
  DocumentIcon,
  StarIcon,
  ClockIcon,
  TagIcon,
} from '@heroicons/react/24/outline'

/**
 * Grid View Component for Revolutionary File System
 */
export default function FileSystemGridView({
  entities,
  selectedEntities,
  onFileSelect,
  onFileDoubleClick,
  onContextMenu,
}) {
  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-green-500 bg-green-50'
      default:
        return 'border-gray-300 bg-white'
    }
  }

  const getDifficultyStars = difficulty => {
    const levels = { easy: 1, medium: 2, hard: 3 }
    const stars = levels[difficulty] || 2
    return stars
  }

  const formatDate = dateString => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {entities.map((entity, index) => (
          <motion.div
            key={entity.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`relative group cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedEntities.includes(entity.id)
                ? 'ring-2 ring-blue-500 shadow-md'
                : ''
            }`}
            onClick={() => onFileSelect(entity.id)}
            onDoubleClick={() => onFileDoubleClick(entity.id)}
            onContextMenu={e => onContextMenu(e, entity.id)}
          >
            <div
              className={`relative p-4 rounded-lg border-2 transition-colors ${
                entity.metadata?.priority
                  ? getPriorityColor(entity.metadata.priority)
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* File/Folder Icon */}
              <div className="flex justify-center mb-3">
                {entity.type === 'folder' ? (
                  <FolderIcon className="w-12 h-12 text-blue-500" />
                ) : (
                  <div className="relative">
                    <DocumentIcon className="w-12 h-12 text-gray-600" />
                    {entity.metadata?.priority && (
                      <div
                        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                          entity.metadata.priority === 'high'
                            ? 'bg-red-500'
                            : entity.metadata.priority === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* File Name */}
              <div className="text-center mb-2">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {entity.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {entity.type === 'folder' ? 'Folder' : 'Habit File'}
                </div>
              </div>

              {/* Metadata */}
              {entity.type === 'file' && entity.metadata && (
                <div className="space-y-2">
                  {/* Streak */}
                  {entity.metadata.streak !== undefined && (
                    <div className="flex items-center justify-center space-x-1 text-xs">
                      <span className="text-orange-600 font-medium">
                        {entity.metadata.streak}
                      </span>
                      <span className="text-gray-500">day streak</span>
                    </div>
                  )}

                  {/* Difficulty */}
                  {entity.metadata.difficulty && (
                    <div className="flex justify-center">
                      <div className="flex space-x-0.5">
                        {Array.from({ length: 3 }, (_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-3 h-3 ${
                              i < getDifficultyStars(entity.metadata.difficulty)
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  {entity.metadata.category && (
                    <div className="text-xs text-center text-gray-600 truncate">
                      {entity.metadata.category}
                    </div>
                  )}

                  {/* Tags */}
                  {entity.metadata.tags && entity.metadata.tags.length > 0 && (
                    <div className="flex justify-center">
                      <div className="flex items-center space-x-1">
                        <TagIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {entity.metadata.tags.length}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Completion Rate */}
                  {entity.metadata.completionRate !== undefined && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${entity.metadata.completionRate}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Last Modified */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {formatDate(entity.modifiedAt)}
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedEntities.includes(entity.id) && (
                <div className="absolute top-2 left-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {entities.length === 0 && (
        <div className="py-16 text-center text-gray-500">
          <DocumentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p>No files or folders to display</p>
        </div>
      )}
    </div>
  )
}
