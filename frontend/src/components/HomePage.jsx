import { useState, useEffect } from 'react'

/**
 * Landing page component showing app features and benefits
 * Displays before user authentication with engaging animations
 */
function HomePage({ onShowAuth }) {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: '📋',
      title: 'Create Unlimited Habits',
      description:
        'Build lasting habits with customizable goals and priorities',
    },
    {
      icon: '📊',
      title: 'Track Your Progress',
      description:
        'Visualize streaks, completion rates, and analytics dashboards',
    },
    {
      icon: '🗂️',
      title: 'Organize with Folders',
      description:
        'Create custom categories and organize habits hierarchically',
    },
    {
      icon: '⏱️',
      title: 'Pomodoro Timer',
      description:
        'Built-in focus timer with customizable work and break periods',
    },
    {
      icon: '🔍',
      title: 'Smart Search',
      description: 'Advanced filtering and search to find habits instantly',
    },
    {
      icon: '🎯',
      title: 'Goal Setting',
      description:
        'Set priorities, deadlines, and track achievement milestones',
    },
  ]

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [features.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-10 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16">
          {/* Main Hero Content */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-pink-400 animate-pulse">
              Habit Tracker
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Build lasting habits, track your progress, and achieve your goals
              with our comprehensive habit tracking platform
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={onShowAuth}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Get Started Free 🚀
              </button>
              <button className="px-8 py-4 border-2 border-gray-600 hover:border-emerald-400 text-gray-300 hover:text-emerald-400 font-semibold rounded-lg text-lg transition-all duration-300">
                Watch Demo 📹
              </button>
            </div>
          </div>

          {/* Rotating Features Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything you need to build lasting habits
            </h2>

            {/* Feature Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border transition-all duration-500 transform hover:scale-105 ${
                    index === currentFeature
                      ? 'bg-emerald-600/20 border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-100">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-center space-x-2 mb-16">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentFeature
                      ? 'bg-emerald-400 scale-125'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                10,000+
              </div>
              <div className="text-gray-400">Habits Created</div>
            </div>
            <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="text-3xl font-bold text-cyan-400 mb-2">95%</div>
              <div className="text-gray-400">Success Rate</div>
            </div>
            <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="text-3xl font-bold text-pink-400 mb-2">24/7</div>
              <div className="text-gray-400">Progress Tracking</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
