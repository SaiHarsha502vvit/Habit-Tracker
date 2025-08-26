import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './app/store'
import { useAppDispatch } from './app/hooks'
import { fetchHabits } from './features/habits/habitsSlice'
import { getCurrentUser } from './services/api'
import AddHabitForm from './components/AddHabitForm'
import HabitList from './components/HabitList'
// import AnalyticsDashboard from './components/AnalyticsDashboard'
import AuthModal from './components/AuthModal'

/**
 * Inner app component that uses Redux hooks
 */
function AppContent() {
  const dispatch = useAppDispatch()
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    // Check for existing authentication
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.log('No authenticated user:', error.message)
        // User is not authenticated - this is fine, app works without auth
      }
      setAuthLoading(false)
    }

    checkAuth()
    dispatch(fetchHabits())
  }, [dispatch])

  const handleAuthSuccess = userData => {
    setUser(userData)
    setShowAuthModal(false)
    // Refresh habits to get user-specific data
    dispatch(fetchHabits())
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    // Refresh habits to get anonymous data
    dispatch(fetchHabits())
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Auth */}
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1"></div>
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-gray-100 mb-2">
                Habit Tracker
              </h1>
              <p className="text-gray-400 text-lg">
                Build lasting habits, one day at a time
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-300">
                    👋 Hi, <span className="font-medium">{user.username}</span>!
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors"
                >
                  Sign In / Sign Up
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Analytics Dashboard - Temporarily Disabled */}
        {/* <section className="mb-8">
          <AnalyticsDashboard />
        </section> */}

        {/* Add Habit Form */}
        <section className="mb-8">
          <AddHabitForm />
        </section>

        {/* Habits List */}
        <section>
          <HabitList />
        </section>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#374151',
            color: '#F3F4F6',
            border: '1px solid #4B5563',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#F3F4F6',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#F3F4F6',
            },
          },
        }}
      />
    </div>
  )
}

/**
 * Main App component with Redux Provider
 */
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
