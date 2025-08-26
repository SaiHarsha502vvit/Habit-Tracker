import { useState, useCallback } from 'react'
import { exportUserData, importUserData } from '../services/api'
import toast from 'react-hot-toast'
import {
  usePerformanceMonitor,
  useNetworkStatus,
} from '../utils/performanceUtils'

/**
 * Enhanced component for data export and import functionality
 */
export default function DataExportImport() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [exportStats, setExportStats] = useState(null)

  // Performance monitoring and network status
  const performanceData = usePerformanceMonitor('DataExportImport')
  const { isOnline, connectionType } = useNetworkStatus()

  const handleExportData = useCallback(async () => {
    if (!isOnline) {
      toast.error('Cannot export data while offline')
      return
    }

    try {
      setIsExporting(true)
      setExportStats(null)

      const startTime = performance.now()
      const data = await exportUserData()
      const endTime = performance.now()

      // Parse data to get statistics
      let parsedData = null
      try {
        parsedData = JSON.parse(data)
      } catch {
        console.warn('Could not parse export data for statistics')
      }

      // Create blob and download
      const blob = new Blob([data], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const timestamp = new Date().toISOString().split('T')[0]
      link.download = `habit-tracker-export-${timestamp}.json`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Set export statistics
      setExportStats({
        size: formatFileSize(blob.size),
        habits: parsedData?.habits?.length || 0,
        logs: parsedData?.statistics?.totalLogs || 0,
        sessions: parsedData?.statistics?.totalSessions || 0,
        version: parsedData?.version || 'Unknown',
        exportTime: Math.round(endTime - startTime),
        connectionType,
      })

      toast.success('📥 Data exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error(
        'Failed to export data: ' +
          (error.response?.data?.message || error.message)
      )
    } finally {
      setIsExporting(false)
    }
  }, [isOnline, connectionType])

  const handleImportData = useCallback(
    async event => {
      const file = event.target.files[0]
      if (!file) return

      if (!isOnline) {
        toast.error('Cannot import data while offline')
        return
      }

      if (!file.name.endsWith('.json')) {
        toast.error('Please select a JSON file')
        return
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 10MB')
        return
      }

      try {
        setIsImporting(true)
        setImportResult(null)

        const startTime = performance.now()
        const result = await importUserData(file)
        const endTime = performance.now()

        // Add performance metrics to result
        result.importTime = Math.round(endTime - startTime)
        result.fileSize = formatFileSize(file.size)
        result.connectionType = connectionType

        setImportResult(result)

        if (result.isSuccessful) {
          toast.success(
            `✅ Import successful! Imported ${result.importedHabits} habits`
          )
        } else if (result.failedHabits > 0) {
          toast.error(
            `⚠️ Import partially failed. ${result.failedHabits} habits failed to import`
          )
        } else {
          toast.error('Import failed - no data was imported')
        }

        // Clear file input
        event.target.value = ''
      } catch (error) {
        console.error('Import failed:', error)
        toast.error(
          'Failed to import data: ' +
            (error.response?.data?.error || error.message)
        )
        setImportResult(null)
      } finally {
        setIsImporting(false)
      }
    },
    [isOnline, connectionType]
  )

  const handleExportCsv = useCallback(async () => {
    if (!isOnline) {
      toast.error('Cannot export CSV while offline')
      return
    }

    try {
      setIsExporting(true)

      // For now, this is a placeholder CSV export
      const response = await fetch('/api/export/csv')
      const data = await response.text()

      const blob = new Blob([data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const timestamp = new Date().toISOString().split('T')[0]
      link.download = `habit-tracker-export-${timestamp}.csv`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('📊 CSV exported successfully!')
    } catch (error) {
      console.error('CSV export failed:', error)
      toast.error('Failed to export CSV')
    } finally {
      setIsExporting(false)
    }
  }, [isOnline])

  // Helper function to format file size
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
        <span className="mr-2">📁</span>
        Data Export & Import
        {!isOnline && (
          <span className="ml-2 px-2 py-1 text-xs bg-red-600 rounded-md">
            Offline
          </span>
        )}
      </h3>

      <div className="space-y-6">
        {/* Network Status */}
        <div className="bg-gray-700 rounded-lg p-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Connection Status:</span>
            <span
              className={`font-medium ${
                isOnline ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isOnline ? `Online (${connectionType})` : 'Offline'}
            </span>
          </div>
        </div>

        {/* Export Section */}
        <div>
          <h4 className="text-md font-medium text-gray-200 mb-3">
            Export Data
          </h4>
          <p className="text-gray-400 text-sm mb-4">
            Download all your habits, completion logs, and Pomodoro sessions as
            a backup file.
          </p>

          <div className="flex space-x-3">
            <button
              onClick={handleExportData}
              disabled={isExporting || !isOnline}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>📥 Export JSON</>
              )}
            </button>

            <button
              onClick={handleExportCsv}
              disabled={isExporting || !isOnline}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
            >
              📊 Export CSV
            </button>
          </div>

          {/* Export Statistics */}
          {exportStats && (
            <div className="mt-4 p-4 bg-blue-900 border border-blue-600 rounded-lg">
              <h5 className="font-medium text-blue-100 mb-2">Export Summary</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <span className="font-mono">{exportStats.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span className="font-mono">{exportStats.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Export Time:</span>
                    <span className="font-mono">
                      {exportStats.exportTime}ms
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Habits:</span>
                    <span className="font-mono">{exportStats.habits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Logs:</span>
                    <span className="font-mono">{exportStats.logs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sessions:</span>
                    <span className="font-mono">{exportStats.sessions}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Import Section */}
        <div className="border-t border-gray-600 pt-6">
          <h4 className="text-md font-medium text-gray-200 mb-3">
            Import Data
          </h4>
          <p className="text-gray-400 text-sm mb-4">
            Restore your data from a previously exported JSON file.
          </p>

          <div className="flex items-center space-x-3">
            <label className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center justify-center">
              {isImporting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Importing...
                </>
              ) : (
                <>📤 Select JSON File</>
              )}
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                disabled={isImporting || !isOnline}
                className="hidden"
              />
            </label>
          </div>

          {/* Import Result */}
          {importResult && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                importResult.isSuccessful
                  ? 'bg-green-900 border border-green-600'
                  : 'bg-yellow-900 border border-yellow-600'
              }`}
            >
              <h5 className="font-medium text-green-100 mb-2">
                Import Results
              </h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <span className="font-mono">{importResult.fileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Import Time:</span>
                    <span className="font-mono">
                      {importResult.importTime}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Habits imported:</span>
                    <span className="font-mono">
                      {importResult.importedHabits}/{importResult.totalHabits}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Completion logs:</span>
                    <span className="font-mono">
                      {importResult.importedLogs}/{importResult.totalLogs}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pomodoro sessions:</span>
                    <span className="font-mono">
                      {importResult.importedSessions}/
                      {importResult.totalSessions}
                    </span>
                  </div>
                  {importResult.failedHabits > 0 && (
                    <div className="flex justify-between text-yellow-300">
                      <span>Failed habits:</span>
                      <span className="font-mono">
                        {importResult.failedHabits}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Error details */}
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-3 p-2 bg-red-800 rounded text-xs">
                  <strong>Errors:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {importResult.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importResult.errors.length > 3 && (
                      <li>... and {importResult.errors.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-400 bg-gray-700 p-3 rounded-lg">
          <strong>💡 Tips:</strong>
          <ul className="mt-1 space-y-1">
            <li>
              • JSON format includes all data with statistics and metadata
            </li>
            <li>
              • CSV format is simplified and suitable for spreadsheet
              applications
            </li>
            <li>
              • Import creates new habits - existing data is not overwritten
            </li>
            <li>
              • Large files (&gt;10MB) are not supported for performance reasons
            </li>
            <li>• Keep regular backups of your important habit data</li>
          </ul>
        </div>

        {/* Performance Information */}
        {import.meta.env.DEV && performanceData && (
          <div className="text-xs text-gray-500 bg-gray-700 p-2 rounded">
            <strong>🔧 Debug Info:</strong> Renders:{' '}
            {performanceData.renderCount}, Last:{' '}
            {performanceData.lastRenderTime?.toFixed(2)}ms, Memory:{' '}
            {performanceData.memoryUsage
              ? Math.round(performanceData.memoryUsage / 1024 / 1024) + 'MB'
              : 'N/A'}
          </div>
        )}
      </div>
    </div>
  )
}
