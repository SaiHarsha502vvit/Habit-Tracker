import React from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggleButton = ({ className = '' }) => {
  const { toggleTheme, isDark } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg transition-all duration-300 ease-in-out
        ${
          isDark
            ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400 hover:text-yellow-300'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-800'
        }
        ${className}
      `}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon - Light Mode */}
        <SunIcon
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300
            ${
              isDark
                ? 'opacity-0 scale-0 rotate-90'
                : 'opacity-100 scale-100 rotate-0'
            }
          `}
        />

        {/* Moon Icon - Dark Mode */}
        <MoonIcon
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300
            ${
              isDark
                ? 'opacity-100 scale-100 rotate-0'
                : 'opacity-0 scale-0 -rotate-90'
            }
          `}
        />
      </div>

      {/* Optional text label */}
      <span className="sr-only">
        {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </span>
    </button>
  )
}

export default ThemeToggleButton
