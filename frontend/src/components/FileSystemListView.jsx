import React from 'react'
import { motion } from 'framer-motion'
import {
  FolderIcon,
  DocumentIcon,
  StarIcon,
  ClockIcon,
  TagIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

/**
 * List View Component for Revolutionary File System
 */
export default function FileSystemListView({
  entities,
  selectedEntities,
  onFileSelect,
  onFileDoubleClick,
  onContextMenu,
}) {
  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyStars = difficulty => {
    const levels = { easy: 1, medium: 2, hard: 3 }
    const stars = levels[difficulty] || 2
    return Array.from({ length: 3 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-3 h-3 ${i < stars ? 'text-yellow-500' : 'text-gray-300'}`}
        fill={i < stars ? 'currentColor' : 'none'}
      />
    ))
  }

  const formatDate = dateString => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const formatFileSize = size => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
            <th className="px-4 py-3 min-w-64">Name</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Difficulty</th>
            <th className="px-4 py-3">Streak</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Size</th>
            <th className="px-4 py-3">Modified</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entities.map((entity, index) => (
            <motion.tr
              key={entity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedEntities.includes(entity.id)
                  ? 'bg-blue-50 border-l-4 border-blue-500'
                  : ''
              }`}
              onClick={() => onFileSelect(entity.id)}
              onDoubleClick={() => onFileDoubleClick(entity.id)}
              onContextMenu={e => onContextMenu(e, entity.id)}
            >
              {/* Name Column */}
              <td className="px-4 py-3">
                <div className="flex items-center space-x-3">
                  {entity.type === 'folder' ? (
                    <FolderIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <DocumentIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {entity.name}
                    </div>
                    {entity.metadata?.tags &&
                      entity.metadata.tags.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <TagIcon className="w-3 h-3 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {entity.metadata.tags
                              .slice(0, 3)
                              .map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            {entity.metadata.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{entity.metadata.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </td>

              {/* Type Column */}
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {entity.type === 'folder' ? 'Folder' : 'Habit File'}
                </span>
              </td>

              {/* Priority Column */}
              <td className="px-4 py-3">
                {entity.metadata?.priority && (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      entity.metadata.priority
                    )}`}
                  >
                    {entity.metadata.priority}
                  </span>
                )}
              </td>

              {/* Difficulty Column */}
              <td className="px-4 py-3">
                {entity.metadata?.difficulty && (
                  <div className="flex items-center space-x-1">
                    {getDifficultyStars(entity.metadata.difficulty)}
                  </div>
                )}
              </td>

              {/* Streak Column */}
              <td className="px-4 py-3">
                {entity.metadata?.streak !== undefined && (
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-orange-600">
                      {entity.metadata.streak}
                    </span>
                    <span className="text-xs text-gray-500">days</span>
                  </div>
                )}
              </td>

              {/* Category Column */}
              <td className="px-4 py-3">
                {entity.metadata?.category && (
                  <span className="text-sm text-gray-600">
                    {entity.metadata.category}
                  </span>
                )}
              </td>

              {/* Size Column */}
              <td className="px-4 py-3">
                <span className="text-sm text-gray-500">
                  {entity.size ? formatFileSize(entity.size) : '-'}
                </span>
              </td>

              {/* Modified Column */}
              <td className="px-4 py-3">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <CalendarIcon className="w-3 h-3" />
                  <span>{formatDate(entity.modifiedAt)}</span>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {entities.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <DocumentIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p>No files or folders to display</p>
        </div>
      )}
    </div>
  )
}
