import React from 'react'
import { Link } from 'react-router-dom'

/**
 * ActionButtons - Three main action buttons for judges
 * Floating action buttons that enable key features:
 * 1. Report Incident - submit emergency report
 * 2. SOS Emergency - send location-based emergency alert
 * 3. Ask AI Assistant - get safety guidance
 */
interface ActionButtonsProps {
  onSOS: () => void
  sosLoading?: boolean
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onSOS, sosLoading = false }) => {
  return (
    <div className="absolute bottom-6 left-6 right-6 max-w-xs z-30">
      <div className="space-y-3">
        {/* SOS Button - Large, urgent, red */}
        <button
          onClick={onSOS}
          disabled={sosLoading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <span className="text-2xl animate-pulse">🚨</span>
          <span>{sosLoading ? 'Sending...' : 'SOS Emergency'}</span>
        </button>

        {/* Report Incident Button */}
        <Link
          to="/report"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 text-center"
        >
          <span className="text-xl">📝</span>
          <span>Report Incident</span>
        </Link>

        {/* Ask AI Assistant Button */}
        <Link
          to="/assistant"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 text-center"
        >
          <span className="text-xl">🤖</span>
          <span>Get Safety Guidance</span>
        </Link>
      </div>
    </div>
  )
}