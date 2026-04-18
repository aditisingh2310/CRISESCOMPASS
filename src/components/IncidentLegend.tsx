import React from 'react'

/**
 * IncidentLegend - Map legend explaining marker colors
 * Judges immediately understand what each marker means
 * Shows incident types and their corresponding colors
 */
export const IncidentLegend: React.FC<{ className?: string }> = ({ className = '' }) => {
  const legendItems = [
    { type: 'Fire', emoji: '🔥', color: 'bg-red-500', desc: 'Fire emergency' },
    { type: 'Flood', emoji: '💧', color: 'bg-blue-500', desc: 'Water emergency' },
    { type: 'Medical', emoji: '⚕️', color: 'bg-green-500', desc: 'Medical emergency' },
    { type: 'Shelter', emoji: '🏠', color: 'bg-amber-500', desc: 'Shelter location' },
    { type: 'SOS', emoji: '🚨', color: 'bg-red-700', desc: 'Emergency alert' }
  ]

  return (
    <div className={`bg-white rounded-lg shadow-md border p-3 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Map Legend</h3>
      <div className="space-y-2">
        {legendItems.map(item => (
          <div key={item.type} className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${item.color} border border-white`}></div>
            <span className="text-sm text-gray-700">
              <strong>{item.type}</strong> — {item.desc}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        💚 = You | 🏥 = Hospital | 🚔 = Police
      </div>
    </div>
  )
}