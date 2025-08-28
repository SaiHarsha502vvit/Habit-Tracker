import { useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for handling keyboard shortcuts
 * 
 * @param {Object} shortcuts - Object mapping key combinations to callback functions
 * @param {React.RefObject} targetRef - Reference to the target element (optional)
 * @param {Object} options - Configuration options
 */
export const useKeyboardShortcuts = (shortcuts, targetRef = null, options = {}) => {
  const {
    preventDefault = true,
    stopPropagation = true,
    ignoreInputs = true,
    enabled = true
  } = options
  
  const shortcutsRef = useRef(shortcuts)
  
  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])
  
  useEffect(() => {
    if (!enabled) return
    
    const handleKeyDown = (event) => {
      // Skip if target is an input, textarea, or contenteditable element
      if (ignoreInputs) {
        const target = event.target
        const tagName = target.tagName.toLowerCase()
        const isEditable = target.contentEditable === 'true'
        
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || isEditable) {
          return
        }
      }
      
      // Build key combination string
      const keys = []
      
      if (event.ctrlKey || event.metaKey) keys.push('ctrl')
      if (event.shiftKey) keys.push('shift')
      if (event.altKey) keys.push('alt')
      
      // Handle special keys
      let keyName = event.key.toLowerCase()
      switch (keyName) {
        case ' ':
          keyName = 'space'
          break
        case 'arrowup':
          keyName = 'up'
          break
        case 'arrowdown':
          keyName = 'down'
          break
        case 'arrowleft':
          keyName = 'left'
          break
        case 'arrowright':
          keyName = 'right'
          break
        case 'enter':
        case 'escape':
        case 'tab':
        case 'delete':
        case 'backspace':
        case 'home':
        case 'end':
        case 'pageup':
        case 'pagedown':
          // Keep as is
          break
        default:
          // For F keys
          if (keyName.startsWith('f') && keyName.length <= 3 && !isNaN(keyName.slice(1))) {
            // F1, F2, etc.
            break
          }
          // For regular letters/numbers, use the key as-is
          break
      }
      
      keys.push(keyName)
      const shortcutKey = keys.join('+')
      
      // Check if this key combination has a handler
      const handler = shortcutsRef.current[shortcutKey]
      if (handler && typeof handler === 'function') {
        // CRITICAL: Always prevent default for our shortcuts to prevent browser actions
        if (preventDefault) {
          event.preventDefault()
        }
        if (stopPropagation) {
          event.stopPropagation()
        }
        
        // Call the handler
        try {
          handler(event)
        } catch (error) {
          console.error('Error in keyboard shortcut handler:', error)
        }
      }
    }
    
    // Attach event listener to target element or document
    const element = targetRef?.current || document
    
    // Use capture phase to handle events before they reach other elements
    element.addEventListener('keydown', handleKeyDown, { capture: true })
    
    // Cleanup
    return () => {
      element.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [targetRef, preventDefault, stopPropagation, ignoreInputs, enabled])
}

/**
 * Legacy hook for file system operations (keeping for compatibility)
 * Linux file manager inspired shortcuts
 */
export const useFileSystemKeyboardShortcuts = ({
  selectedEntities = [],
  entities = [],
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onSelectAll,
  onRename,
  onNewFolder,
  onNewFile,
  onProperties,
  onRefresh,
  onFind,
  onEscape,
  enabled = true,
}) => {
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return

    // Prevent shortcuts when typing in input fields
    const activeElement = document.activeElement
    const isTyping = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    )

    if (isTyping && !['Escape', 'F2', 'F5'].includes(event.key)) return

    const { ctrlKey, metaKey, shiftKey, altKey, key } = event
    const isCtrl = ctrlKey || metaKey
    const keyLower = key.toLowerCase()

    // Handle different shortcut combinations
    if (isCtrl && shiftKey) {
      // Ctrl+Shift shortcuts
      switch (keyLower) {
        case 'n':
          event.preventDefault()
          onNewFolder && onNewFolder()
          break
        default:
          break
      }
    } else if (isCtrl && altKey) {
      // Ctrl+Alt shortcuts
      switch (keyLower) {
        case 'n':
          event.preventDefault()
          onNewFile && onNewFile()
          break
        default:
          break
      }
    } else if (altKey) {
      // Alt shortcuts
      switch (key) {
        case 'Enter':
          event.preventDefault()
          if (selectedEntities.length > 0) {
            onProperties && onProperties(selectedEntities)
          }
          break
        default:
          break
      }
    } else if (isCtrl) {
      // Ctrl shortcuts
      switch (keyLower) {
        case 'c':
          event.preventDefault()
          if (selectedEntities.length > 0) {
            onCopy && onCopy(selectedEntities)
          }
          break
        case 'x':
          event.preventDefault()
          if (selectedEntities.length > 0) {
            onCut && onCut(selectedEntities)
          }
          break
        case 'v':
          event.preventDefault()
          onPaste && onPaste()
          break
        case 'a':
          event.preventDefault()
          if (entities.length > 0) {
            onSelectAll && onSelectAll(entities.map(e => e.id))
          }
          break
        case 'f':
          event.preventDefault()
          onFind && onFind()
          break
        case 'r':
          event.preventDefault()
          onRefresh && onRefresh()
          break
        default:
          break
      }
    } else {
      // Single key shortcuts
      switch (key) {
        case 'Delete':
        case 'Backspace':
          event.preventDefault()
          if (selectedEntities.length > 0) {
            onDelete && onDelete(selectedEntities)
          }
          break
        case 'F2':
          event.preventDefault()
          if (selectedEntities.length === 1) {
            onRename && onRename(selectedEntities[0])
          }
          break
        case 'F5':
          event.preventDefault()
          onRefresh && onRefresh()
          break
        case 'Escape':
          event.preventDefault()
          onEscape && onEscape()
          break
        default:
          break
      }
    }
  }, [
    enabled,
    selectedEntities,
    entities,
    onCopy,
    onCut,
    onPaste,
    onDelete,
    onSelectAll,
    onRename,
    onNewFolder,
    onNewFile,
    onProperties,
    onRefresh,
    onFind,
    onEscape,
  ])

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])

  // Return shortcut information for display
  return {
    shortcuts: [
      { keys: 'Ctrl+C', description: 'Copy selected items' },
      { keys: 'Ctrl+X', description: 'Cut selected items' },
      { keys: 'Ctrl+V', description: 'Paste items' },
      { keys: 'Ctrl+A', description: 'Select all items' },
      { keys: 'Ctrl+F', description: 'Find/Search' },
      { keys: 'Ctrl+R', description: 'Refresh' },
      { keys: 'Delete', description: 'Delete selected items' },
      { keys: 'F2', description: 'Rename selected item' },
      { keys: 'F5', description: 'Refresh' },
      { keys: 'Ctrl+Shift+N', description: 'New folder' },
      { keys: 'Ctrl+Alt+N', description: 'New file' },
      { keys: 'Alt+Enter', description: 'Properties' },
      { keys: 'Escape', description: 'Cancel current action' },
    ]
  }
}

/**
 * Hook for handling global keyboard shortcuts
 * 
 * @param {Object} shortcuts - Object mapping key combinations to callback functions
 * @param {Object} options - Configuration options
 */
export const useGlobalKeyboardShortcuts = (shortcuts, options = {}) => {
  return useKeyboardShortcuts(shortcuts, null, options)
}

/**
 * Hook for handling element-specific keyboard shortcuts
 * 
 * @param {React.RefObject} elementRef - Reference to the target element
 * @param {Object} shortcuts - Object mapping key combinations to callback functions
 * @param {Object} options - Configuration options
 */
export const useElementKeyboardShortcuts = (elementRef, shortcuts, options = {}) => {
  return useKeyboardShortcuts(shortcuts, elementRef, options)
}

export default useKeyboardShortcuts
