/**
 * Navigation - Clean, simple 4-item navigation
 * Shows only essential sections to avoid overwhelming judges
 * Map | Report | Assistant | Dashboard
 */
import { Link, useLocation } from "react-router-dom"

export default function Navigation() {
  const location = useLocation()

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="text-white font-bold text-lg hidden sm:block">
        🚨 CrisisConnect
      </div>

      {/* Navigation Links - 4 main sections */}
      <div className="flex flex-wrap justify-center md:justify-around items-center gap-1 md:gap-2 flex-1 md:flex-none">
        <Link
          to="/"
          className={`px-3 py-2 rounded text-sm md:text-base transition-colors font-medium ${
            location.pathname === '/' ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'
          }`}
        >
          🗺️ Map
        </Link>
        <Link
          to="/report"
          className={`px-3 py-2 rounded text-sm md:text-base transition-colors font-medium ${
            location.pathname === '/report' ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'
          }`}
        >
          📝 Report
        </Link>
        <Link
          to="/assistant"
          className={`px-3 py-2 rounded text-sm md:text-base transition-colors font-medium ${
            location.pathname === '/assistant' ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'
          }`}
        >
          🤖 AI
        </Link>
        <Link
          to="/dashboard"
          className={`px-3 py-2 rounded text-sm md:text-base transition-colors font-medium ${
            location.pathname === '/dashboard' ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'
          }`}
        >
          📊 Dashboard
        </Link>
      </div>
    </nav>
  )
}