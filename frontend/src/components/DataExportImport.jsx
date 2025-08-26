import { useState } from 'react'
import { exportUserData, importUserData } from '../services/api'
import toast from 'react-hot-toast'

/**
 * Component for data export and import functionality
 */
export default function DataExportImport() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  const handleExportData = async () => {
    try {
      setIsExporting(true)
      const data = await exportUserData()
      
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

      toast.success('📥 Data exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export data: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportData = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a JSON file')
      return
    }

    try {
      setIsImporting(true)
      setImportResult(null)
      
      const result = await importUserData(file)
      setImportResult(result)

      if (result.isSuccessful) {
        toast.success(`✅ Import successful! Imported ${result.importedHabits} habits`)
      } else if (result.failedHabits > 0) {
        toast.error(`⚠️ Import partially failed. ${result.failedHabits} habits failed to import`)
      } else {
        toast.error('Import failed - no data was imported')
      }

      // Clear file input
      event.target.value = ''
    } catch (error) {
      console.error('Import failed:', error)
      toast.error('Failed to import data: ' + (error.response?.data?.error || error.message))
      setImportResult(null)
    } finally {
      setIsImporting(false)
    }
  }

  const handleExportCsv = async () => {
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
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
        <span className="mr-2">📁</span>
        Data Export & Import
      </h3>

      <div className="space-y-6">
        {/* Export Section */}
        <div>
          <h4 className="text-md font-medium text-gray-200 mb-3">Export Data</h4>
          <p className="text-gray-400 text-sm mb-4">
            Download all your habits, completion logs, and Pomodoro sessions as a backup file.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  📥 Export JSON
                </>
              )}
            </button>
            
            <button
              onClick={handleExportCsv}
              disabled={isExporting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
            >
              📊 Export CSV
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="border-t border-gray-600 pt-6">
          <h4 className="text-md font-medium text-gray-200 mb-3">Import Data</h4>
          <p className="text-gray-400 text-sm mb-4">
            Restore your data from a previously exported JSON file.
          </p>

          <div className="flex items-center space-x-3">
            <label className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center justify-center">
              {isImporting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  📤 Select JSON File
                </>
              )}
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              importResult.isSuccessful ? 'bg-green-900 border border-green-600' : 'bg-yellow-900 border border-yellow-600'
            }`}>
              <h5 className="font-medium text-green-100 mb-2">Import Results</h5>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Habits imported:</span>
                  <span className="font-mono">{importResult.importedHabits}/{importResult.totalHabits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion logs:</span>
                  <span className="font-mono">{importResult.importedLogs}/{importResult.totalLogs}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pomodoro sessions:</span>
                  <span className="font-mono">{importResult.importedSessions}/{importResult.totalSessions}</span>
                </div>
                {importResult.failedHabits > 0 && (
                  <div className="flex justify-between text-yellow-300">
                    <span>Failed habits:</span>
                    <span className="font-mono">{importResult.failedHabits}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-400 bg-gray-700 p-3 rounded-lg">
          <strong>💡 Tips:</strong>
          <ul className="mt-1 space-y-1">
            <li>• JSON format includes all data (habits, logs, Pomodoro sessions)</li>
            <li>• CSV format is simplified and suitable for spreadsheet applications</li>
            <li>• Import will create new habits - existing data is not overwritten</li>
            <li>• Keep regular backups of your important habit data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}