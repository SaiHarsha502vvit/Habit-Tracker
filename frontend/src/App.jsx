import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './app/store'
import { useAppDispatch } from './app/hooks'
import { fetchHabits } from './features/habits/habitsSlice'
import AddHabitForm from './components/AddHabitForm'
import HabitList from './components/HabitList'

/**
 * Inner app component that uses Redux hooks
 */
function AppContent() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchHabits())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Habit Tracker
          </h1>
          <p className="text-gray-400 text-lg">
            Build lasting habits, one day at a time
          </p>
        </header>

        {/* Add Habit Form */}
        <section className="mb-12">
          <AddHabitForm />
        </section>

        {/* Habits List */}
        <section>
          <HabitList />
        </section>
      </main>

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
