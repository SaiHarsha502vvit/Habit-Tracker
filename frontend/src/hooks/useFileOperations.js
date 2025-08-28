import { useState, useCallback } from 'react'

/**
 * Custom hook for file system operations
 * Handles clipboard, selection, and file operations
 */
export const useFileOperations = () => {
  const [clipboard, setClipboard] = useState(null)
  const [selectedEntities, setSelectedEntities] = useState([])
  const [draggedItems, setDraggedItems] = useState([])
  const [operationHistory, setOperationHistory] = useState([])

  // Selection operations
  const selectEntity = useCallback((entityId) => {
    setSelectedEntities([entityId])
  }, [])

  const multiSelect = useCallback((entityIds) => {
    setSelectedEntities(entityIds)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedEntities([])
  }, [])

  const toggleSelection = useCallback((entityId) => {
    setSelectedEntities(prev => 
      prev.includes(entityId)
        ? prev.filter(id => id !== entityId)
        : [...prev, entityId]
    )
  }, [])

  // Clipboard operations
  const copyToClipboard = useCallback((entityIds, action = 'copy') => {
    setClipboard({
      entityIds,
      action,
      timestamp: Date.now(),
    })
  }, [])

  const cutToClipboard = useCallback((entityIds) => {
    copyToClipboard(entityIds, 'cut')
  }, [copyToClipboard])

  const clearClipboard = useCallback(() => {
    setClipboard(null)
  }, [])

  // File operations
  const copyEntities = useCallback((entityIds) => {
    copyToClipboard(entityIds, 'copy')
    // Add to operation history
    setOperationHistory(prev => [...prev, {
      type: 'copy',
      entityIds,
      timestamp: Date.now(),
    }])
  }, [copyToClipboard])

  const cutEntities = useCallback((entityIds) => {
    cutToClipboard(entityIds)
    // Add to operation history
    setOperationHistory(prev => [...prev, {
      type: 'cut',
      entityIds,
      timestamp: Date.now(),
    }])
  }, [cutToClipboard])

  const pasteEntities = useCallback((targetFolderId = null) => {
    if (!clipboard) return null

    const operation = {
      type: 'paste',
      sourceAction: clipboard.action,
      entityIds: clipboard.entityIds,
      targetFolderId,
      timestamp: Date.now(),
    }

    // Add to operation history
    setOperationHistory(prev => [...prev, operation])

    // Clear clipboard if it was a cut operation
    if (clipboard.action === 'cut') {
      clearClipboard()
    }

    return operation
  }, [clipboard, clearClipboard])

  // Drag and drop operations
  const startDrag = useCallback((entityIds) => {
    setDraggedItems(entityIds)
  }, [])

  const endDrag = useCallback(() => {
    setDraggedItems([])
  }, [])

  const dropEntities = useCallback((targetFolderId, draggedEntityIds) => {
    const operation = {
      type: 'move',
      entityIds: draggedEntityIds,
      targetFolderId,
      timestamp: Date.now(),
    }

    setOperationHistory(prev => [...prev, operation])
    endDrag()
    
    return operation
  }, [endDrag])

  // Utility functions
  const getSelectedEntitiesInfo = useCallback((entities) => {
    const selected = entities.filter(e => selectedEntities.includes(e.id))
    return {
      count: selected.length,
      totalSize: selected.reduce((acc, e) => acc + (e.size || 0), 0),
      types: [...new Set(selected.map(e => e.type))],
      entities: selected,
    }
  }, [selectedEntities])

  const canPaste = useCallback(() => {
    return clipboard && clipboard.entityIds.length > 0
  }, [clipboard])

  const getClipboardInfo = useCallback(() => {
    return clipboard ? {
      action: clipboard.action,
      count: clipboard.entityIds.length,
      timestamp: clipboard.timestamp,
    } : null
  }, [clipboard])

  // Undo/Redo functionality
  const undoLastOperation = useCallback(() => {
    const lastOperation = operationHistory[operationHistory.length - 1]
    if (!lastOperation) return null

    // Remove last operation from history
    setOperationHistory(prev => prev.slice(0, -1))
    
    return {
      ...lastOperation,
      type: `undo_${lastOperation.type}`,
      timestamp: Date.now(),
    }
  }, [operationHistory])

  const clearHistory = useCallback(() => {
    setOperationHistory([])
  }, [])

  return {
    // State
    selectedEntities,
    clipboard,
    draggedItems,
    operationHistory,

    // Selection methods
    selectEntity,
    multiSelect,
    clearSelection,
    toggleSelection,

    // Clipboard methods
    copyEntities,
    cutEntities,
    pasteEntities,
    clearClipboard,
    canPaste,
    getClipboardInfo,

    // Drag and drop methods
    startDrag,
    endDrag,
    dropEntities,

    // Utility methods
    getSelectedEntitiesInfo,
    undoLastOperation,
    clearHistory,
  }
}
