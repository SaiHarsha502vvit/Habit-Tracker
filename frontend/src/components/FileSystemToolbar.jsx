import React, { useState } from 'react'
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

/**
 * Toolbar Component for Revolutionary File System
 */
export default function FileSystemToolbar({
  searchQuery,
  onSearchChange,
  viewState,
  onSortChange,
  entities,
}) {
  const [showFilters, setShowFilters] = useState(false)

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'modified', label: 'Date Modified' },
    { value: 'size', label: 'Size' },
    { value: 'priority', label: 'Priority' },
    { value: 'streak', label: 'Streak' },
  ]

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between p-3">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search habits, folders, tags..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex items-center space-x-2 ml-4">
          {/* Sort Dropdown */}
          <select
            value={viewState.sortBy}
            onChange={e => onSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Sort Order Indicator */}
          <div className="text-xs text-gray-500 px-2">
            {viewState.sortOrder === 'asc' ? '↑' : '↓'}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            title="Advanced Filters"
          >
            <FunnelIcon className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="View Settings"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Priority Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">All Categories</option>
                {/* Dynamically populated from entities */}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Showing {entities.length} items
            </div>
            <button
              onClick={() => setShowFilters(false)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Hide Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
