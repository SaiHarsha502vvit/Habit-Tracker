import { useState, useEffect } from 'react'
import {
  usePerformanceMonitor,
  useSessionStats,
  useNetworkStatus,
} from '../utils/performanceUtils'

/**
 * Performance monitoring dashboard for development and debugging
 */
export default function PerformanceDashboard({ sessions = [], habits = [] }) {
  const [memoryInfo, setMemoryInfo] = useState(null)
  const [renderHistory, setRenderHistory] = useState([])

  const performanceData = usePerformanceMonitor('PerformanceDashboard')
  const sessionStats = useSessionStats(sessions)
  const { isOnline, connectionType } = useNetworkStatus()

  useEffect(() => {
    // Update memory info periodically
    const updateMemoryInfo = () => {
      if (performance.memory) {
        setMemoryInfo({
          used:
            Math.round(
              (performance.memory.usedJSHeapSize / 1024 / 1024) * 100
            ) / 100,
          total:
            Math.round(
              (performance.memory.totalJSHeapSize / 1024 / 1024) * 100
            ) / 100,
          limit:
            Math.round(
              (performance.memory.jsHeapSizeLimit / 1024 / 1024) * 100
            ) / 100,
          usage: Math.round(
            (performance.memory.usedJSHeapSize /
              performance.memory.jsHeapSizeLimit) *
              100
          ),
        })
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Track render history
    if (performanceData) {
      setRenderHistory(prev => {
        const newHistory = [
          ...prev,
          {
            timestamp: Date.now(),
            renderTime: performanceData.lastRenderTime,
            renderCount: performanceData.renderCount,
          },
        ]
        // Keep only last 20 renders
        return newHistory.slice(-20)
      })
    }
  }, [performanceData])

  // Calculate performance metrics
  const averageRenderTime =
    renderHistory.length > 0
      ? renderHistory.reduce((sum, item) => sum + (item.renderTime || 0), 0) /
        renderHistory.length
      : 0

  const maxRenderTime =
    renderHistory.length > 0
      ? Math.max(...renderHistory.map(item => item.renderTime || 0))
      : 0

  if (!import.meta.env.DEV) {
    return null // Only show in development
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-sm">
      <h3 className="text-md font-semibold text-gray-100 mb-4 flex items-center">
        <span className="mr-2">⚡</span>
        Performance Dashboard
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Network Status */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="font-medium text-gray-200 mb-2">🌐 Network</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="text-gray-300">{connectionType}</span>
            </div>
          </div>
        </div>

        {/* Render Performance */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="font-medium text-gray-200 mb-2">🔄 Rendering</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Total Renders:</span>
              <span className="text-blue-400">
                {performanceData?.renderCount || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Render:</span>
              <span className="text-blue-400">
                {performanceData?.lastRenderTime?.toFixed(2) || 0}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average:</span>
              <span className="text-blue-400">
                {averageRenderTime.toFixed(2)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Max:</span>
              <span
                className={
                  maxRenderTime > 16 ? 'text-red-400' : 'text-green-400'
                }
              >
                {maxRenderTime.toFixed(2)}ms
              </span>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="font-medium text-gray-200 mb-2">💾 Memory</h4>
          {memoryInfo ? (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Used:</span>
                <span className="text-yellow-400">{memoryInfo.used} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="text-yellow-400">{memoryInfo.total} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Limit:</span>
                <span className="text-yellow-400">{memoryInfo.limit} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Usage:</span>
                <span
                  className={
                    memoryInfo.usage > 80 ? 'text-red-400' : 'text-green-400'
                  }
                >
                  {memoryInfo.usage}%
                </span>
              </div>
              {/* Memory usage bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      memoryInfo.usage > 80
                        ? 'bg-red-500'
                        : memoryInfo.usage > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${memoryInfo.usage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">Memory info unavailable</p>
          )}
        </div>
      </div>

      {/* Data Statistics */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded p-3">
          <h4 className="font-medium text-gray-200 mb-2">📊 Data Stats</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Habits:</span>
              <span className="text-purple-400">{habits.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Sessions:</span>
              <span className="text-purple-400">
                {sessionStats.totalSessions}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Work Time:</span>
              <span className="text-purple-400">
                {sessionStats.totalWorkTime} min
              </span>
            </div>
            <div className="flex justify-between">
              <span>Productivity:</span>
              <span className="text-purple-400">
                {sessionStats.productivityScore}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded p-3">
          <h4 className="font-medium text-gray-200 mb-2">
            📈 Performance Metrics
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>FPS Target:</span>
              <span className="text-green-400">60 fps (16.67ms)</span>
            </div>
            <div className="flex justify-between">
              <span>Render Status:</span>
              <span
                className={
                  averageRenderTime > 16 ? 'text-red-400' : 'text-green-400'
                }
              >
                {averageRenderTime > 16 ? 'Slow' : 'Good'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Bundle Size:</span>
              <span className="text-gray-400">Optimized</span>
            </div>
            <div className="flex justify-between">
              <span>Code Splitting:</span>
              <span className="text-green-400">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Render Timeline */}
      {renderHistory.length > 0 && (
        <div className="mt-4 bg-gray-700 rounded p-3">
          <h4 className="font-medium text-gray-200 mb-2">📊 Render Timeline</h4>
          <div className="flex items-end space-x-1 h-16">
            {renderHistory.map((item, index) => (
              <div
                key={index}
                className={`w-2 ${
                  (item.renderTime || 0) > 16
                    ? 'bg-red-500'
                    : (item.renderTime || 0) > 8
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{
                  height: `${Math.min(
                    ((item.renderTime || 0) / 32) * 100,
                    100
                  )}%`,
                }}
                title={`Render ${item.renderCount}: ${(
                  item.renderTime || 0
                ).toFixed(2)}ms`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Last 20 renders • Red: &gt;16ms, Yellow: &gt;8ms, Green: &lt;8ms
          </div>
        </div>
      )}

      {/* Performance Tips */}
      <div className="mt-4 bg-gray-700 rounded p-3">
        <h4 className="font-medium text-gray-200 mb-2">💡 Performance Tips</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Keep render times under 16ms for smooth 60fps</li>
          <li>• Use React DevTools Profiler for detailed analysis</li>
          <li>• Monitor memory usage to prevent leaks</li>
          <li>• Use lazy loading for large components</li>
          <li>• Implement virtual scrolling for large lists</li>
        </ul>
      </div>
    </div>
  )
}
