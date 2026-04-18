import React from 'react'
import { Link } from 'react-router-dom'

/**
 * EmptyStateHint - User-friendly message when no incidents exist
 * Encourages demo mode or incident submission
 * Guides users on next steps
 */
interface EmptyStateHintProps {
  onEnableDemoMode: () => void
  demoModeEnabled: boolean
  className?: string
}

export const EmptyStateHint: React.FC<EmptyStateHintProps> = ({
  onEnableDemoMode,
  demoModeEnabled,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border p-6 text-center max-w-sm mx-auto mt-8 ${className}`}>
      <div className="text-5xl mb-3">🌍</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        No incidents yet — system ready!
      </h2>
      <p className="text-gray-600 text-sm mb-4">
        Try reporting an incident or enabling Demo Mode to see the platform in action.
      </p>

      <div className="space-y-2">
        <Link
          to="/report"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold transition-colors"
        >
          📝 Report an Incident
        </Link>

        <button
          onClick={onEnableDemoMode}
          className={`w-full px-4 py-2 rounded-md font-semibold transition-colors ${
            demoModeEnabled
              ? 'bg-purple-100 text-purple-800 border border-purple-400'
              : 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-600'
          }`}
        >
          {demoModeEnabled ? '✓ Demo Mode Active' : '🎮 Enable Demo Mode'}
        </button>
      </div>

      {demoModeEnabled && (
        <p className="text-xs text-purple-600 mt-3 font-semibold">
          ✨ Demo incidents will appear on the map automatically
        </p>
      )}
    </div>
  )
}