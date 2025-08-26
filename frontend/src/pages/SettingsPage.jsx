import { useState, useEffect } from 'react'
import NotificationSettings from '../components/NotificationSettings'
import DataExportImport from '../components/DataExportImport'

/**
 * Settings page combining notification preferences and data management
 */
export default function SettingsPage() {
  // Check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)

    // Listen for storage changes (logout in other tabs)
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem('token')
      setIsAuthenticated(!!currentToken)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Don't render if user is not authenticated
  if (!isAuthenticated) return null
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">⚙️ Settings</h1>
        <p className="text-gray-400">
          Customize your Habit Tracker experience with notifications, sounds,
          and data management
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notification Settings */}
        <div>
          <NotificationSettings />
        </div>

        {/* Data Export/Import */}
        <div>
          <DataExportImport />
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
          <span className="mr-2">🚀</span>
          Performance & Tips
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-200 mb-2">🔔 Notifications</h4>
            <ul className="text-gray-400 space-y-1">
              <li>• Enable notifications for better focus reminders</li>
              <li>• Sounds work even when tab is not focused</li>
              <li>• Adjust volume based on your environment</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-200 mb-2">
              📊 Data Management
            </h4>
            <ul className="text-gray-400 space-y-1">
              <li>• Export data regularly for backups</li>
              <li>• JSON format preserves all session data</li>
              <li>• Import creates new habits (no overwrite)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-200 mb-2">
              🍅 Pomodoro Sessions
            </h4>
            <ul className="text-gray-400 space-y-1">
              <li>• Sessions are tracked automatically</li>
              <li>• Take breaks for better productivity</li>
              <li>• View statistics to track progress</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-200 mb-2">⚡ Performance</h4>
            <ul className="text-gray-400 space-y-1">
              <li>• App optimized for minimal resource usage</li>
              <li>• Timer runs efficiently in background</li>
              <li>• Data cached for faster loading</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="text-center text-gray-500 text-sm">
        Habit Tracker v2.0 - Enhanced with Pomodoro session tracking,
        notifications, and data management
      </div>
    </div>
  )
}
