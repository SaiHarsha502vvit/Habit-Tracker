import { lazy } from 'react'

/**
 * Lazy-loaded components for code splitting and performance optimization
 */

// Settings and heavy components loaded on demand
export const SettingsPage = lazy(() => import('../pages/SettingsPage'))
export const PomodoroStats = lazy(() => import('../components/PomodoroStats'))
export const DataExportImport = lazy(() => import('../components/DataExportImport'))
export const NotificationSettings = lazy(() => import('../components/NotificationSettings'))

// Optional: Create loading wrapper
export const LazyWrapper = ({ fallback = null }) => {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      {fallback || (
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-600 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      )}
    </div>
  )
}