/**
 * Notification service for browser notifications, sounds, and preferences
 */

class NotificationService {
  constructor() {
    this.permissionGranted = false
    this.soundEnabled = true
    this.notificationsEnabled = true
    this.volume = 0.7
    this.soundPresets = {
      completion: this.createCompletionSound(),
      break: this.createBreakSound(),
      warning: this.createWarningSound()
    }
    
    this.loadPreferences()
    this.requestPermission()
  }

  /**
   * Request notification permission from the browser
   */
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      this.permissionGranted = permission === 'granted'
      return this.permissionGranted
    }
    return false
  }

  /**
   * Show a browser notification
   */
  showNotification(title, options = {}) {
    if (!this.notificationsEnabled || !this.permissionGranted) {
      console.log('📱 Notification (disabled):', title, options.body)
      return
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'habit-tracker',
        requireInteraction: false,
        ...options
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }

  /**
   * Play sound effect
   */
  playSound(type = 'completion') {
    if (!this.soundEnabled) return

    try {
      const sound = this.soundPresets[type]
      if (sound) {
        sound.volume = this.volume
        sound.play().catch(() => {
          // Fallback to simpler sound
          this.playFallbackSound()
        })
      }
    } catch (error) {
      console.error('Failed to play sound:', error)
      this.playFallbackSound()
    }
  }

  /**
   * Create completion sound (success tone)
   */
  createCompletionSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    const sound = {
      play: async () => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // Success melody
        const frequencies = [523.25, 659.25, 783.99] // C, E, G
        const duration = 0.2
        
        frequencies.forEach((freq, index) => {
          setTimeout(() => {
            const osc = audioContext.createOscillator()
            const gain = audioContext.createGain()
            
            osc.connect(gain)
            gain.connect(audioContext.destination)
            
            osc.frequency.value = freq
            osc.type = 'sine'
            
            gain.gain.setValueAtTime(0.1, audioContext.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
            
            osc.start(audioContext.currentTime)
            osc.stop(audioContext.currentTime + duration)
          }, index * 150)
        })
      },
      volume: this.volume
    }
    
    return sound
  }

  /**
   * Create break sound (gentle chime)
   */
  createBreakSound() {
    return {
      play: async () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 440 // A note
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      },
      volume: this.volume
    }
  }

  /**
   * Create warning sound (urgent beep)
   */
  createWarningSound() {
    return {
      play: async () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            oscillator.frequency.value = 800
            oscillator.type = 'square'
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
            
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.1)
          }, i * 200)
        }
      },
      volume: this.volume
    }
  }

  /**
   * Fallback sound using simple beep
   */
  playFallbackSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcCEWT1O7Qf')
      audio.volume = this.volume
      audio.play().catch(() => {})
    } catch (error) {
      console.error('All sound methods failed:', error)
    }
  }

  /**
   * Notification methods for different timer events
   */
  notifyPomodoroComplete(habitName, sessionCount) {
    this.showNotification(`🍅 Pomodoro Complete!`, {
      body: `Great job! You completed a focus session for "${habitName}". Sessions today: ${sessionCount}`,
      icon: '🍅'
    })
    this.playSound('completion')
  }

  notifyBreakTime(breakType, duration) {
    const emoji = breakType === 'short' ? '☕' : '🧘'
    this.showNotification(`${emoji} Break Time!`, {
      body: `Time for a ${breakType} break (${duration} minutes). You've earned it!`,
      icon: emoji
    })
    this.playSound('break')
  }

  notifyTimerWarning(remainingMinutes) {
    this.showNotification(`⏰ Timer Warning`, {
      body: `${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'} remaining in your focus session`,
      icon: '⏰'
    })
    this.playSound('warning')
  }

  /**
   * Preferences management
   */
  updatePreferences(preferences) {
    this.soundEnabled = preferences.soundEnabled ?? this.soundEnabled
    this.notificationsEnabled = preferences.notificationsEnabled ?? this.notificationsEnabled
    this.volume = preferences.volume ?? this.volume
    
    this.savePreferences()
  }

  getPreferences() {
    return {
      soundEnabled: this.soundEnabled,
      notificationsEnabled: this.notificationsEnabled,
      volume: this.volume,
      permissionGranted: this.permissionGranted
    }
  }

  savePreferences() {
    const preferences = {
      soundEnabled: this.soundEnabled,
      notificationsEnabled: this.notificationsEnabled,
      volume: this.volume
    }
    localStorage.setItem('habitTracker_notifications', JSON.stringify(preferences))
  }

  loadPreferences() {
    try {
      const saved = localStorage.getItem('habitTracker_notifications')
      if (saved) {
        const preferences = JSON.parse(saved)
        this.soundEnabled = preferences.soundEnabled ?? true
        this.notificationsEnabled = preferences.notificationsEnabled ?? true
        this.volume = preferences.volume ?? 0.7
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error)
    }
  }
}

// Create and export singleton instance
const notificationService = new NotificationService()
export default notificationService