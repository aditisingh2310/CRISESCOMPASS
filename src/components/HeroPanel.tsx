import React from 'react'

/**
 * HeroPanel - 10-second elevator pitch
 * Displays CrisisConnect's core value proposition
 * Shows on first load and can be dismissed
 */
interface HeroPanelProps {
  onDismiss: () => void
  visible: boolean
}

export const HeroPanel: React.FC<HeroPanelProps> = ({ onDismiss, visible }) => {
  if (!visible) return null

  return (
    <div className="absolute top-4 left-4 right-4 max-w-md bg-white rounded-lg shadow-lg border-l-4 border-blue-600 p-4 z-40 animate-fadeIn">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-2">
        🚨 CrisisConnect
      </h1>
      <p className="text-sm text-gray-600 mb-3 font-medium">
        Real-time disaster coordination platform
      </p>

      <div className="space-y-2 text-sm">
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 font-bold">•</span>
          <span className="text-gray-700">
            <strong>Report emergencies instantly</strong> — location-based incident reporting
          </span>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 font-bold">•</span>
          <span className="text-gray-700">
            <strong>See live incidents on the map</strong> — real-time visualization
          </span>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 font-bold">•</span>
          <span className="text-gray-700">
            <strong>Get AI safety guidance</strong> — instant emergency instructions
          </span>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
      >
        Got it! Show me the map →
      </button>
    </div>
  )
}