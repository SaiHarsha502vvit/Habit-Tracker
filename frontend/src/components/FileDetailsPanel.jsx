import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  DocumentIcon,
  PencilIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  StarIcon,
  ChartBarIcon,
  FireIcon,
} from '@heroicons/react/24/outline'

/**
 * File Details Panel Component
 */
export default function FileDetailsPanel({ file, onClose, onEdit }) {
  const formatDate = dateString => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  const formatFileSize = size => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

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
        className={`w-4 h-4 ${
          i < stars ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="relative bg-white h-full w-96 shadow-xl overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <DocumentIcon className="w-6 h-6 text-gray-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {file.name}
                </h2>
                <p className="text-sm text-gray-500">Habit File</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Quick Actions */}
            <div className="flex space-x-2">
              <button
                onClick={onEdit}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Habit
              </button>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                Basic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    File Size
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatFileSize(file.size || 0)}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Created
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(file.createdAt)}
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Last Modified
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(file.modifiedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Habit Metadata */}
            {file.metadata && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  Habit Details
                </h3>

                {/* Priority */}
                {file.metadata.priority && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Priority
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          file.metadata.priority
                        )}`}
                      >
                        {file.metadata.priority}
                      </span>
                    </div>
                  </div>
                )}

                {/* Difficulty */}
                {file.metadata.difficulty && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Difficulty
                    </label>
                    <div className="flex items-center space-x-1 mt-1">
                      {getDifficultyStars(file.metadata.difficulty)}
                      <span className="text-sm text-gray-600 ml-2 capitalize">
                        {file.metadata.difficulty}
                      </span>
                    </div>
                  </div>
                )}

                {/* Category */}
                {file.metadata.category && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Category
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {file.metadata.category}
                    </p>
                  </div>
                )}

                {/* Current Streak */}
                {file.metadata.streak !== undefined && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Current Streak
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <FireIcon className="w-5 h-5 text-orange-500" />
                      <span className="text-lg font-semibold text-orange-600">
                        {file.metadata.streak}
                      </span>
                      <span className="text-sm text-gray-600">days</span>
                    </div>
                  </div>
                )}

                {/* Completion Rate */}
                {file.metadata.completionRate !== undefined && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Completion Rate
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-900">
                          {file.metadata.completionRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.metadata.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Estimated Duration */}
                {file.metadata.estimatedDuration && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Estimated Duration
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {file.metadata.estimatedDuration} minutes
                      </span>
                    </div>
                  </div>
                )}

                {/* Last Completed */}
                {file.metadata.lastCompleted && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Last Completed
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {formatDate(file.metadata.lastCompleted)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {file.metadata.tags && file.metadata.tags.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {file.metadata.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          <TagIcon className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Statistics Section */}
            {file.habitData && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  Statistics
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <ChartBarIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-gray-900">
                      {file.metadata?.completionRate || 0}%
                    </div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FireIcon className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-gray-900">
                      {file.metadata?.streak || 0}
                    </div>
                    <div className="text-xs text-gray-500">Day Streak</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
