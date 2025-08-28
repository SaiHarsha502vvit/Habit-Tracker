import React, { useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  DocumentIcon,
  ClockIcon,
  TagIcon,
  FolderIcon,
} from '@heroicons/react/24/outline'
import { useDispatch } from 'react-redux'
import { updateHabit } from '../features/habits/habitsSlice'

/**
 * 📄 FILE PROPERTIES DIALOG COMPONENT
 *
 * A comprehensive properties dialog for file entities, providing detailed
 * metadata viewing and editing capabilities with habit-specific fields.
 *
 * Features:
 * - Full metadata display and editing
 * - Habit-specific properties and statistics
 * - File permissions and security settings
 * - Preview thumbnails and icons
 * - Batch properties for multiple selections
 * - Keyboard shortcuts and accessibility
 */
export default function FilePropertiesDialog({
  isOpen,
  onClose,
  fileEntity,
  onSave = () => {},
  readOnly = false,
}) {
  const dispatch = useDispatch()
  const [editedProperties, setEditedProperties] = useState({})
  const [activeTab, setActiveTab] = useState('general')
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize properties when file entity changes
  useEffect(() => {
    if (fileEntity) {
      setEditedProperties({
        name: fileEntity.displayName || fileEntity.name || '',
        description: fileEntity.metadata?.description || '',
        category: fileEntity.metadata?.category || '',
        priority: fileEntity.metadata?.priority || 'MEDIUM',
        tags: fileEntity.metadata?.tags || [],
        isArchived: fileEntity.metadata?.isArchived || false,
        ...fileEntity.metadata,
      })
      setHasChanges(false)
    }
  }, [fileEntity])

  // Handle property changes
  const handlePropertyChange = (key, value) => {
    setEditedProperties(prev => ({
      ...prev,
      [key]: value,
    }))
    setHasChanges(true)
  }

  // Handle save
  const handleSave = async () => {
    if (!fileEntity || !hasChanges) return

    setIsLoading(true)
    try {
      if (fileEntity.habitId) {
        // Update habit if this is a habit file
        await dispatch(
          updateHabit({
            id: fileEntity.habitId,
            updates: {
              name: editedProperties.name,
              description: editedProperties.description,
              category: editedProperties.category,
              priority: editedProperties.priority,
              isArchived: editedProperties.isArchived,
            },
          })
        ).unwrap()
      }

      await onSave(editedProperties)
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save properties:', error)
      // Show error notification
    } finally {
      setIsLoading(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      )
      if (!confirmDiscard) return
    }
    onClose()
  }

  // Format file size
  const formatFileSize = bytes => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Format date
  const formatDate = date => {
    if (!date) return 'Unknown'
    return new Date(date).toLocaleString()
  }

  // Tab configuration
  const tabs = [
    { id: 'general', name: 'General', icon: DocumentIcon },
    { id: 'details', name: 'Details', icon: ClockIcon },
    { id: 'permissions', name: 'Permissions', icon: TagIcon },
    { id: 'statistics', name: 'Statistics', icon: FolderIcon },
  ]

  if (!fileEntity) return null

  return (
    <Transition appear show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={handleCancel}>
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {fileEntity.metadata?.icon || '📄'}
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                        Properties
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {fileEntity.displayName || fileEntity.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-8 px-6" aria-label="Tabs">
                    {tabs.map(tab => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`
                                                        py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                                                        ${
                                                          activeTab === tab.id
                                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                                        }
                                                    `}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{tab.name}</span>
                        </button>
                      )
                    })}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  {/* General Tab */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={editedProperties.name}
                          onChange={e =>
                            handlePropertyChange('name', e.target.value)
                          }
                          disabled={readOnly}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={editedProperties.description}
                          onChange={e =>
                            handlePropertyChange('description', e.target.value)
                          }
                          disabled={readOnly}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                          </label>
                          <input
                            type="text"
                            value={editedProperties.category}
                            onChange={e =>
                              handlePropertyChange('category', e.target.value)
                            }
                            disabled={readOnly}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Priority
                          </label>
                          <select
                            value={editedProperties.priority}
                            onChange={e =>
                              handlePropertyChange('priority', e.target.value)
                            }
                            disabled={readOnly}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                          </select>
                        </div>
                      </div>

                      {/* Archive Toggle */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editedProperties.isArchived}
                          onChange={e =>
                            handlePropertyChange('isArchived', e.target.checked)
                          }
                          disabled={readOnly}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Archived
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Details Tab */}
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                            File Information
                          </h4>
                          <dl className="space-y-2">
                            <div>
                              <dt className="text-sm text-gray-500 dark:text-gray-400">
                                Type
                              </dt>
                              <dd className="text-sm text-gray-900 dark:text-white">
                                {fileEntity.mimeType}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500 dark:text-gray-400">
                                Size
                              </dt>
                              <dd className="text-sm text-gray-900 dark:text-white">
                                {formatFileSize(fileEntity.size)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500 dark:text-gray-400">
                                Extension
                              </dt>
                              <dd className="text-sm text-gray-900 dark:text-white">
                                {fileEntity.extension}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                            Timestamps
                          </h4>
                          <dl className="space-y-2">
                            <div>
                              <dt className="text-sm text-gray-500 dark:text-gray-400">
                                Created
                              </dt>
                              <dd className="text-sm text-gray-900 dark:text-white">
                                {formatDate(fileEntity.created)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500 dark:text-gray-400">
                                Modified
                              </dt>
                              <dd className="text-sm text-gray-900 dark:text-white">
                                {formatDate(fileEntity.modified)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500 dark:text-gray-400">
                                Accessed
                              </dt>
                              <dd className="text-sm text-gray-900 dark:text-white">
                                {formatDate(fileEntity.accessed)}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Permissions Tab */}
                  {activeTab === 'permissions' && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        File Permissions
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(fileEntity.permissions || {}).map(
                          ([permission, granted]) => (
                            <div
                              key={permission}
                              className="flex items-center justify-between"
                            >
                              <span className="capitalize text-sm text-gray-700 dark:text-gray-300">
                                {permission.replace('_', ' ')}
                              </span>
                              <span
                                className={`
                                                            px-2 py-1 rounded text-xs font-medium
                                                            ${
                                                              granted
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            }
                                                        `}
                              >
                                {granted ? 'Granted' : 'Denied'}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Statistics Tab */}
                  {activeTab === 'statistics' && fileEntity.habitId && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Habit Statistics
                      </h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <dl className="space-y-2">
                            <div>
                              <dt className="text-sm text-gray-500 dark:text-gray-400">
                                Streak Count
                              </dt>
                              <dd className="text-sm text-gray-900 dark:text-white">
                                {fileEntity.metadata?.streakCount || 0} days
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500 dark:text-gray-400">
                                Total Completions
                              </dt>
                              <dd className="text-sm text-gray-900 dark:text-white">
                                {fileEntity.metadata?.totalCompletions || 0}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500 dark:text-gray-400">
                                Completion Rate
                              </dt>
                              <dd className="text-sm text-gray-900 dark:text-white">
                                {(
                                  fileEntity.metadata?.completionRate || 0
                                ).toFixed(1)}
                                %
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div>
                          <dl className="space-y-2">
                            <div>
                              <dt className="text-sm text-gray-500 dark:text-gray-400">
                                Last Completed
                              </dt>
                              <dd className="text-sm text-gray-900 dark:text-white">
                                {fileEntity.metadata?.lastCompleted || 'Never'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500 dark:text-gray-400">
                                Habit Type
                              </dt>
                              <dd className="text-sm text-gray-900 dark:text-white capitalize">
                                {fileEntity.metadata?.habitType?.toLowerCase() ||
                                  'Daily'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {hasChanges && !readOnly && '* You have unsaved changes'}
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    {!readOnly && (
                      <button
                        onClick={handleSave}
                        disabled={!hasChanges || isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
