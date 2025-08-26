import { useState } from 'react'
import EnhancedHabitDashboard from '../components/EnhancedHabitDashboard'

/**
 * Demo Page showcasing the complete implementation
 * This page demonstrates all Phase 1 and Phase 2 features
 */
export default function DemoPage() {
  const [currentDemo, setCurrentDemo] = useState('dashboard')

  const demoFeatures = [
    {
      id: 'dashboard',
      title: '🚀 Complete Dashboard',
      description: 'Full integration of search, folders, and Pomodoro features',
      component: EnhancedHabitDashboard
    },
    {
      id: 'pomodoro',
      title: '🍅 Pomodoro Features',
      description: 'Session planning, automatic transitions, and completion celebrations',
      features: [
        'Plan complete Pomodoro cycles (1-8 sessions)',
        'Automatic break management (short/long breaks)',
        'Timer presets (Classic, Deep Work, Sprint)',
        'Progress tracking with visual indicators',
        'Completion celebrations with statistics',
        'Auto-advance between work and break phases'
      ]
    },
    {
      id: 'search',
      title: '🔍 Advanced Search',
      description: 'Multi-criteria search with autocomplete and filtering',
      features: [
        'Text search across names, descriptions, and tags',
        'Advanced filters (category, priority, type, dates)',
        'Tag-based filtering with AND/OR logic',
        'Search autocomplete with suggestions',
        'Search history and saved searches',
        'Real-time search results'
      ]
    },
    {
      id: 'folders',
      title: '📁 Hierarchical Organization',
      description: 'Folder-based organization with smart folders',
      features: [
        'Create nested folder structures',
        'Drag & drop habit organization',
        'Smart folders (auto-populated)',
        'Folder-based habit filtering',
        'Bulk operations on folders',
        'System folders (High Priority, Today\'s Focus)'
      ]
    }
  ]

  const FeatureDemo = ({ feature }) => (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-3">{feature.title.split(' ')[0]}</span>
        <div>
          <h3 className="text-xl font-semibold text-white">{feature.title.substring(2)}</h3>
          <p className="text-gray-300 text-sm">{feature.description}</p>
        </div>
      </div>

      {feature.features && (
        <div className="space-y-2">
          {feature.features.map((item, index) => (
            <div key={index} className="flex items-center text-gray-200">
              <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              🏆 Enhanced Habit Tracker Demo
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Complete implementation of advanced Pomodoro technique and search system
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                ✅ Phase 1: Pomodoro Complete
              </div>
              <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                ✅ Phase 2: Search Complete
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {demoFeatures.map(feature => (
              <button
                key={feature.id}
                onClick={() => setCurrentDemo(feature.id)}
                className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                  currentDemo === feature.id
                    ? 'text-blue-400 border-blue-400'
                    : 'text-gray-300 border-transparent hover:text-white hover:border-gray-600'
                }`}
              >
                {feature.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {currentDemo === 'dashboard' ? (
          <EnhancedHabitDashboard />
        ) : (
          <div className="max-w-4xl mx-auto">
            <FeatureDemo feature={demoFeatures.find(f => f.id === currentDemo)} />
            
            {/* Implementation Details */}
            <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                💻 Implementation Details
              </h3>
              
              {currentDemo === 'pomodoro' && (
                <div className="space-y-4 text-gray-200">
                  <div>
                    <h4 className="font-medium text-white mb-2">Backend Components:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><code className="bg-gray-700 px-2 py-1 rounded">PomodoroSessionSet</code> - Complete cycle tracking entity</li>
                      <li><code className="bg-gray-700 px-2 py-1 rounded">PomodoroSessionSetService</code> - Cycle management logic</li>
                      <li><code className="bg-gray-700 px-2 py-1 rounded">PomodoroSessionSetController</code> - REST API endpoints</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">Frontend Components:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><code className="bg-gray-700 px-2 py-1 rounded">SessionPlanningModal</code> - Cycle setup with presets</li>
                      <li><code className="bg-gray-700 px-2 py-1 rounded">EnhancedTimerSession</code> - Timer with phase transitions</li>
                      <li><code className="bg-gray-700 px-2 py-1 rounded">CompletionCelebrationModal</code> - Achievement celebration</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentDemo === 'search' && (
                <div className="space-y-4 text-gray-200">
                  <div>
                    <h4 className="font-medium text-white mb-2">Backend Components:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><code className="bg-gray-700 px-2 py-1 rounded">HabitSearchService</code> - Multi-criteria search engine</li>
                      <li><code className="bg-gray-700 px-2 py-1 rounded">HabitSearchController</code> - Search API endpoints</li>
                      <li><code className="bg-gray-700 px-2 py-1 rounded">Enhanced HabitRepository</code> - Advanced query methods</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">Frontend Components:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><code className="bg-gray-700 px-2 py-1 rounded">AdvancedSearchBar</code> - Search with autocomplete</li>
                      <li><code className="bg-gray-700 px-2 py-1 rounded">AdvancedFiltersPanel</code> - Comprehensive filtering</li>
                      <li><code className="bg-gray-700 px-2 py-1 rounded">searchSlice</code> - Redux state management</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentDemo === 'folders' && (
                <div className="space-y-4 text-gray-200">
                  <div>
                    <h4 className="font-medium text-white mb-2">Backend Components:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><code className="bg-gray-700 px-2 py-1 rounded">HabitFolder</code> - Hierarchical folder entity</li>
                      <li><code className="bg-gray-700 px-2 py-1 rounded">HabitFolderService</code> - Folder lifecycle management</li>
                      <li><code className="bg-gray-700 px-2 py-1 rounded">HabitFolderController</code> - Folder REST API</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">Frontend Components:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><code className="bg-gray-700 px-2 py-1 rounded">FolderTreeNavigation</code> - Hierarchical folder display</li>
                      <li><code className="bg-gray-700 px-2 py-1 rounded">Folder management modals</code> - Create, edit, delete folders</li>
                      <li><code className="bg-gray-700 px-2 py-1 rounded">Smart folder logic</code> - Auto-populated folders</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Get Started */}
            <div className="mt-8 bg-gradient-to-r from-green-900 to-blue-900 rounded-lg border border-green-600 p-6 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                🎉 Ready to Experience the Full Dashboard?
              </h3>
              <p className="text-green-100 mb-4">
                Click below to see all features working together in the integrated dashboard
              </p>
              <button
                onClick={() => setCurrentDemo('dashboard')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
              >
                Launch Full Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mb-2">
            🏗️ Built with React, Redux Toolkit, Spring Boot, and MySQL
          </p>
          <p className="text-sm">
            Features: Enhanced Pomodoro Technique • Advanced Search & Filtering • Hierarchical Organization
          </p>
        </div>
      </div>
    </div>
  )
}