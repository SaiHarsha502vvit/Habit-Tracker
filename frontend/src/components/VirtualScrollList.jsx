import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'

/**
 * High-performance virtual scroll list component
 * Implements window-based rendering with advanced scrolling algorithms
 * Based on proven open-source patterns from react-window and react-virtualized
 */
export default function VirtualScrollList({
  items = [],
  itemHeight = 48,
  containerHeight = 336, // 7 items * 48px = 336px
  overscan = 3, // Number of items to render outside visible area
  renderItem,
  className = '',
  onScroll,
}) {
  const scrollRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef(null)

  // Calculate visible range with overscan
  const visibleRange = useMemo(() => {
    const containerStart = scrollTop
    const containerEnd = scrollTop + containerHeight

    const startIndex = Math.max(
      0,
      Math.floor(containerStart / itemHeight) - overscan
    )
    const endIndex = Math.min(
      items.length - 1,
      Math.floor(containerEnd / itemHeight) + overscan
    )

    return { startIndex, endIndex }
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length])

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      key: item.id || startIndex + index,
    }))
  }, [items, visibleRange])

  // Total height for scroll area
  const totalHeight = items.length * itemHeight

  // Handle scroll with debouncing and performance optimization
  const handleScroll = useCallback(
    event => {
      const newScrollTop = event.target.scrollTop
      setScrollTop(newScrollTop)

      // Track scrolling state for performance optimizations
      if (!isScrolling) {
        setIsScrolling(true)
      }

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Set scrolling to false after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 150)

      // Call external onScroll handler
      if (onScroll) {
        onScroll(event)
      }
    },
    [isScrolling, onScroll]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // Smooth scroll methods for programmatic scrolling
  const scrollToItem = useCallback(
    (index, align = 'auto') => {
      if (!scrollRef.current) return

      const itemTop = index * itemHeight
      const itemBottom = itemTop + itemHeight
      const currentScrollTop = scrollRef.current.scrollTop
      const scrollBottom = currentScrollTop + containerHeight

      let newScrollTop = currentScrollTop

      if (
        align === 'start' ||
        (align === 'auto' && itemTop < currentScrollTop)
      ) {
        newScrollTop = itemTop
      } else if (
        align === 'end' ||
        (align === 'auto' && itemBottom > scrollBottom)
      ) {
        newScrollTop = itemBottom - containerHeight
      } else if (align === 'center') {
        newScrollTop = itemTop - (containerHeight - itemHeight) / 2
      }

      scrollRef.current.scrollTo({
        top: Math.max(0, Math.min(newScrollTop, totalHeight - containerHeight)),
        behavior: 'smooth',
      })
    },
    [itemHeight, containerHeight, totalHeight]
  )

  // Scroll methods
  const scrollMethods = useMemo(
    () => ({
      scrollToItem,
      scrollToTop: () => scrollToItem(0, 'start'),
      scrollToBottom: () => scrollToItem(items.length - 1, 'end'),
    }),
    [scrollToItem, items.length]
  )

  // Expose scroll methods via ref
  React.useImperativeHandle(
    scrollRef,
    () => ({
      ...scrollRef.current,
      ...scrollMethods,
    }),
    [scrollMethods]
  )

  const isDevelopment =
    typeof window !== 'undefined' &&
    window.location &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        className="overflow-auto custom-scrollbar"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* Spacer for items before visible range */}
        <div
          style={{ height: visibleRange.startIndex * itemHeight }}
          aria-hidden="true"
        />

        {/* Visible items */}
        <div>
          {visibleItems.map(({ item, index, key }) => (
            <div
              key={key}
              style={{ height: itemHeight }}
              data-index={index}
              className="virtual-item"
            >
              {renderItem(item, index, isScrolling)}
            </div>
          ))}
        </div>

        {/* Spacer for items after visible range */}
        <div
          style={{
            height: (items.length - visibleRange.endIndex - 1) * itemHeight,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Scroll indicators */}
      {items.length > 7 && (
        <div className="absolute right-1 top-1 bottom-1 w-1 bg-gray-600 rounded opacity-30 hover:opacity-60 transition-opacity">
          <div
            className="bg-gray-400 rounded"
            style={{
              height: `${Math.max(10, (containerHeight / totalHeight) * 100)}%`,
              transform: `translateY(${
                (scrollTop / totalHeight) * containerHeight
              }px)`,
            }}
          />
        </div>
      )}

      {/* Performance indicator (dev mode only) */}
      {isDevelopment && (
        <div className="absolute top-2 right-8 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded opacity-50">
          Rendering {visibleItems.length} / {items.length}
          {isScrolling && ' (scrolling)'}
        </div>
      )}
    </div>
  )
}

// Custom scrollbar styles for enhanced UX
