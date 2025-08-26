import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderIcon,
  DocumentIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ScissorsIcon,
  ClipboardIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

/**
 * Context Menu Component for Revolutionary File System
 */
export default function FileSystemContextMenu({
  x,
  y,
  target,
  onClose,
  entities,
  onCreateFolder,
  onCreateHabit,
}) {
  const menuRef = useRef(null)
  const targetEntity = entities.find(e => e.id === target)

  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Adjust position if menu would go off-screen
  const adjustedX = Math.min(x, window.innerWidth - 200)
  const adjustedY = Math.min(y, window.innerHeight - 300)

  const menuItems = []

  if (targetEntity) {
    // Entity-specific menu items
    if (targetEntity.type === 'file') {
      menuItems.push(
        {
          icon: PencilIcon,
          label: 'Edit Habit',
          action: () => {
            console.log('Edit habit:', targetEntity.name)
            onClose()
          },
        },
        {
          icon: InformationCircleIcon,
          label: 'View Details',
          action: () => {
            console.log('View details:', targetEntity.name)
            onClose()
          },
        },
        { separator: true }
      )
    }

    menuItems.push(
      {
        icon: DocumentDuplicateIcon,
        label: 'Copy',
        action: () => {
          console.log('Copy:', targetEntity.name)
          onClose()
        },
      },
      {
        icon: ScissorsIcon,
        label: 'Cut',
        action: () => {
          console.log('Cut:', targetEntity.name)
          onClose()
        },
      },
      {
        icon: PencilIcon,
        label: 'Rename',
        action: () => {
          console.log('Rename:', targetEntity.name)
          onClose()
        },
      },
      {
        icon: TrashIcon,
        label: 'Delete',
        action: () => {
          console.log('Delete:', targetEntity.name)
          onClose()
        },
        danger: true,
      }
    )
  } else {
    // Empty space menu items
    menuItems.push(
      {
        icon: DocumentIcon,
        label: 'New Habit File',
        action: () => {
          onCreateHabit()
          onClose()
        },
      },
      {
        icon: FolderIcon,
        label: 'New Folder',
        action: () => {
          onCreateFolder()
          onClose()
        },
      },
      { separator: true },
      {
        icon: ClipboardIcon,
        label: 'Paste',
        action: () => {
          console.log('Paste')
          onClose()
        },
        disabled: true, // TODO: Enable when clipboard has items
      }
    )
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50" style={{ pointerEvents: 'none' }}>
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-48"
          style={{
            left: adjustedX,
            top: adjustedY,
            pointerEvents: 'auto',
          }}
        >
          {menuItems.map((item, index) => {
            if (item.separator) {
              return <div key={index} className="h-px bg-gray-200 my-1" />
            }

            return (
              <button
                key={index}
                onClick={item.action}
                disabled={item.disabled}
                className={`w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${
                  item.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : item.disabled
                    ? 'text-gray-400 cursor-not-allowed hover:bg-gray-50'
                    : 'text-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                {item.label}
                {item.shortcut && (
                  <span className="ml-auto text-xs text-gray-400">
                    {item.shortcut}
                  </span>
                )}
              </button>
            )
          })}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
