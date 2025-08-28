import React, { useMemo } from 'react'
import {
  ChevronRightIcon,
  HomeIcon,
  FolderIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline'
import { useSelector, useDispatch } from 'react-redux'
import {
  setCurrentFolder,
  setSelectedEntities,
} from '../features/fileSystem/fileSystemSlice'

/**
 * 🧭 BREADCRUMB NAVIGATION COMPONENT
 *
 * Provides path-based navigation for the file system, showing the current
 * location hierarchy and enabling navigation to parent directories.
 *
 * Features:
 * - Visual path hierarchy with clickable breadcrumbs
 * - Home button for root navigation
 * - Keyboard navigation support
 * - Context menu on breadcrumb items
 * - Path copying functionality
 * - Responsive design for mobile
 */
export default function BreadcrumbNavigation({
  currentPath = '/',
  onNavigate = () => {},
  showHome = true,
  maxDepth = 10,
  className = '',
}) {
  const dispatch = useDispatch()
  const { folderStructure } = useSelector(state => state.fileSystem)

  // Find folder information in the structure
  const findFolderInfo = useMemo(() => {
    return (folderId, structure) => {
      if (!structure) return null

      for (const folder of structure) {
        if (folder.id === folderId || folder.name === folderId) {
          return folder
        }

        if (folder.children) {
          const found = findFolderInfo(folderId, folder.children)
          if (found) return found
        }
      }

      return null
    }
  }, [])
  const breadcrumbs = useMemo(() => {
    if (!currentPath || currentPath === '/') {
      return showHome
        ? [{ id: 'root', name: 'Home', path: '/', isRoot: true }]
        : []
    }

    const segments = currentPath
      .split('/')
      .filter(segment => segment.length > 0)
    const crumbs = []

    if (showHome) {
      crumbs.push({ id: 'root', name: 'Home', path: '/', isRoot: true })
    }

    // Build path segments
    let buildingPath = ''
    segments.forEach((segment, index) => {
      buildingPath += '/' + segment

      // Get folder info if available
      const folderInfo = findFolderInfo(segment, folderStructure)

      crumbs.push({
        id: segment,
        name: folderInfo?.name || decodeURIComponent(segment),
        path: buildingPath,
        isLast: index === segments.length - 1,
        folderInfo,
      })
    })

    // Limit depth if specified
    if (maxDepth && crumbs.length > maxDepth) {
      const start = crumbs.slice(0, 1) // Keep home
      const end = crumbs.slice(-maxDepth + 2)
      return [
        ...start,
        { id: 'ellipsis', name: '...', path: null, isEllipsis: true },
        ...end,
      ]
    }

    return crumbs
  }, [currentPath, folderStructure, showHome, maxDepth, findFolderInfo])

  // Handle breadcrumb click
  const handleBreadcrumbClick = (breadcrumb, event) => {
    event.preventDefault()

    if (breadcrumb.isEllipsis || !breadcrumb.path) {
      return
    }

    // Clear current selection when navigating
    dispatch(setSelectedEntities([]))

    // Navigate to the path
    if (breadcrumb.isRoot) {
      dispatch(setCurrentFolder(null))
      onNavigate('/')
    } else {
      dispatch(setCurrentFolder(breadcrumb.id))
      onNavigate(breadcrumb.path)
    }
  }

  // Handle right-click context menu
  const handleContextMenu = (breadcrumb, event) => {
    event.preventDefault()

    if (breadcrumb.isEllipsis) return

    // Build context menu items
    const menuItems = [
      {
        id: 'navigate',
        label: 'Go to Folder',
        action: () => handleBreadcrumbClick(breadcrumb, event),
      },
      {
        id: 'copy_path',
        label: 'Copy Path',
        action: () => copyPathToClipboard(breadcrumb.path),
      },
    ]

    if (!breadcrumb.isRoot && !breadcrumb.isLast) {
      menuItems.push(
        { id: 'separator', type: 'separator' },
        {
          id: 'open_new_tab',
          label: 'Open in New Tab',
          action: () => openInNewTab(breadcrumb.path),
        }
      )
    }

    // Show context menu (implement based on your context menu system)
    showContextMenu(event.clientX, event.clientY, menuItems)
  }

  // Handle keyboard navigation
  const handleKeyDown = (breadcrumb, event) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        handleBreadcrumbClick(breadcrumb, event)
        break
      case 'ArrowLeft':
        // Navigate to previous breadcrumb
        navigateToPrevious(breadcrumb)
        break
      case 'ArrowRight':
        // Navigate to next breadcrumb
        navigateToNext(breadcrumb)
        break
    }
  }

  // Copy path to clipboard
  const copyPathToClipboard = async path => {
    try {
      await navigator.clipboard.writeText(path)
      // Show toast notification
      showToast('Path copied to clipboard', 'success')
    } catch (error) {
      console.error('Failed to copy path:', error)
      showToast('Failed to copy path', 'error')
    }
  }

  // Open path in new tab
  const openInNewTab = path => {
    window.open(`/file-manager?path=${encodeURIComponent(path)}`, '_blank')
  }

  // Navigate to previous breadcrumb
  const navigateToPrevious = currentBreadcrumb => {
    const currentIndex = breadcrumbs.findIndex(
      b => b.id === currentBreadcrumb.id
    )
    if (currentIndex > 0) {
      const previous = breadcrumbs[currentIndex - 1]
      if (!previous.isEllipsis) {
        handleBreadcrumbClick(previous, { preventDefault: () => {} })
      }
    }
  }

  // Navigate to next breadcrumb
  const navigateToNext = currentBreadcrumb => {
    const currentIndex = breadcrumbs.findIndex(
      b => b.id === currentBreadcrumb.id
    )
    if (currentIndex < breadcrumbs.length - 1) {
      const next = breadcrumbs[currentIndex + 1]
      if (!next.isEllipsis) {
        handleBreadcrumbClick(next, { preventDefault: () => {} })
      }
    }
  }

  // Placeholder functions (implement based on your notification system)
  const showContextMenu = (x, y, items) => {
    // Implement context menu display
    console.log('Show context menu at', x, y, 'with items:', items)
  }

  const showToast = (message, type) => {
    // Implement toast notification
    console.log(`${type.toUpperCase()}: ${message}`)
  }

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <nav
      className={`
                flex items-center space-x-1 p-3 bg-white dark:bg-gray-800 
                border-b border-gray-200 dark:border-gray-700
                text-sm font-medium text-gray-700 dark:text-gray-300
                overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300
                ${className}
            `}
      role="navigation"
      aria-label="Breadcrumb navigation"
    >
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.id}>
          {/* Breadcrumb Item */}
          <div
            className={`
                            flex items-center space-x-2 px-2 py-1 rounded-md
                            transition-all duration-200 ease-in-out
                            ${
                              breadcrumb.isEllipsis
                                ? 'cursor-default text-gray-400 dark:text-gray-500'
                                : breadcrumb.isLast
                                ? 'text-blue-600 dark:text-blue-400 font-semibold cursor-default'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400'
                            }
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                        `}
            onClick={e =>
              !breadcrumb.isEllipsis && handleBreadcrumbClick(breadcrumb, e)
            }
            onContextMenu={e => handleContextMenu(breadcrumb, e)}
            onKeyDown={e => handleKeyDown(breadcrumb, e)}
            tabIndex={breadcrumb.isEllipsis ? -1 : 0}
            role="button"
            aria-label={
              breadcrumb.isEllipsis
                ? 'More folders'
                : `Navigate to ${breadcrumb.name}`
            }
          >
            {/* Icon */}
            {breadcrumb.isRoot ? (
              <HomeIcon className="h-4 w-4 flex-shrink-0" />
            ) : breadcrumb.isEllipsis ? (
              <span className="text-lg leading-none">⋯</span>
            ) : breadcrumb.isLast ? (
              <DocumentIcon className="h-4 w-4 flex-shrink-0" />
            ) : (
              <FolderIcon className="h-4 w-4 flex-shrink-0" />
            )}

            {/* Name */}
            <span
              className={`
                                truncate max-w-xs
                                ${breadcrumb.isLast ? 'font-semibold' : ''}
                            `}
              title={breadcrumb.name}
            >
              {breadcrumb.name}
            </span>

            {/* Additional Info for Current Folder */}
            {breadcrumb.isLast && breadcrumb.folderInfo && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                ({breadcrumb.folderInfo.itemCount || 0} items)
              </span>
            )}
          </div>

          {/* Separator */}
          {index < breadcrumbs.length - 1 && (
            <ChevronRightIcon
              className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0"
              aria-hidden="true"
            />
          )}
        </React.Fragment>
      ))}

      {/* Quick Actions */}
      <div className="flex-grow" />
      <div className="flex items-center space-x-2 ml-4">
        {/* Copy Path Button */}
        <button
          onClick={() => copyPathToClipboard(currentPath)}
          className="
                        p-1.5 rounded-md text-gray-500 dark:text-gray-400
                        hover:bg-gray-100 dark:hover:bg-gray-700
                        hover:text-gray-700 dark:hover:text-gray-300
                        transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                    "
          title="Copy current path"
          aria-label="Copy current path to clipboard"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* Refresh Button */}
        <button
          onClick={() => onNavigate(currentPath, { refresh: true })}
          className="
                        p-1.5 rounded-md text-gray-500 dark:text-gray-400
                        hover:bg-gray-100 dark:hover:bg-gray-700
                        hover:text-gray-700 dark:hover:text-gray-300
                        transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                    "
          title="Refresh current folder"
          aria-label="Refresh current folder"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </nav>
  )
}
