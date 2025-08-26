import { useState, useEffect } from 'react'
import notificationService from '../services/notificationService'
import toast from 'react-hot-toast'

/**
 * Settings component for notification and sound preferences
 */
export default function NotificationSettings() {
  const [preferences, setPreferences] = useState({
    soundEnabled: true,
    notificationsEnabled: true,
    volume: 0.7,
    permissionGranted: false
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load current preferences
    const currentPrefs = notificationService.getPreferences()
    setPreferences(currentPrefs)
  }, [])

  const handleToggleSounds = async () => {
    const newSoundEnabled = !preferences.soundEnabled
    setPreferences(prev => ({ ...prev, soundEnabled: newSoundEnabled }))
    
    notificationService.updatePreferences({ soundEnabled: newSoundEnabled })
    
    // Test sound when enabling
    if (newSoundEnabled) {
      notificationService.playSound('completion')
    }
    
    toast.success(newSoundEnabled ? 'Sounds enabled ✅' : 'Sounds disabled 🔇')
  }

  const handleToggleNotifications = async () => {
    const newNotificationsEnabled = !preferences.notificationsEnabled
    setIsLoading(true)
    
    if (newNotificationsEnabled && !preferences.permissionGranted) {
      // Request permission
      const granted = await notificationService.requestPermission()
      if (!granted) {
        toast.error('Browser notifications are blocked. Please enable them in your browser settings.')
        setIsLoading(false)
        return
      }
      setPreferences(prev => ({ ...prev, permissionGranted: true }))
    }
    
    setPreferences(prev => ({ ...prev, notificationsEnabled: newNotificationsEnabled }))
    notificationService.updatePreferences({ notificationsEnabled: newNotificationsEnabled })
    
    // Test notification when enabling
    if (newNotificationsEnabled) {
      notificationService.showNotification('🔔 Notifications Enabled', {
        body: 'You\'ll now receive focus session alerts!'
      })
    }
    
    toast.success(newNotificationsEnabled ? 'Notifications enabled 🔔' : 'Notifications disabled 🔕')
    setIsLoading(false)
  }

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value)
    setPreferences(prev => ({ ...prev, volume: newVolume }))
    notificationService.updatePreferences({ volume: newVolume })
    
    // Play test sound at new volume
    if (preferences.soundEnabled) {
      setTimeout(() => notificationService.playSound('completion'), 100)
    }
  }

  const testNotification = () => {
    notificationService.notifyPomodoroComplete('Test Habit', 3)
  }

  const testSounds = () => {
    notificationService.playSound('completion')
    setTimeout(() => notificationService.playSound('break'), 500)
    setTimeout(() => notificationService.playSound('warning'), 1000)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
        <span className="mr-2">🔔</span>
        Notification Settings
      </h3>
      
      <div className="space-y-6">
        {/* Browser Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-gray-200 font-medium">Browser Notifications</label>
            <p className="text-gray-400 text-sm">Get desktop notifications for completed sessions</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleToggleNotifications}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                preferences.notificationsEnabled
                  ? 'bg-blue-600'
                  : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            {isLoading && (
              <div className="ml-2 animate-spin h-4 w-4">
                <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Permission Status */}
        {preferences.notificationsEnabled && (
          <div className="ml-4 text-sm">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              preferences.permissionGranted
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {preferences.permissionGranted ? '✅ Permission Granted' : '⚠️ Permission Required'}
            </span>
          </div>
        )}

        {/* Sound Effects */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-gray-200 font-medium">Sound Effects</label>
            <p className="text-gray-400 text-sm">Play audio alerts for timer events</p>
          </div>
          <button
            onClick={handleToggleSounds}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              preferences.soundEnabled
                ? 'bg-blue-600'
                : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Volume Control */}
        {preferences.soundEnabled && (
          <div className="ml-4">
            <label className="text-gray-300 text-sm block mb-2">Volume: {Math.round(preferences.volume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={preferences.volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${preferences.volume * 100}%, #4B5563 ${preferences.volume * 100}%, #4B5563 100%)`
              }}
            />
          </div>
        )}

        {/* Test Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-600">
          <button
            onClick={testNotification}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            🔔 Test Notification
          </button>
          <button
            onClick={testSounds}
            disabled={!preferences.soundEnabled}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            🔊 Test Sounds
          </button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-400 bg-gray-700 p-3 rounded-lg">
          <strong>💡 Tip:</strong> Browser notifications require permission and work best when this tab is not focused. 
          Sound effects work in all browsers and don't require special permissions.
        </div>
      </div>
    </div>
  )
}