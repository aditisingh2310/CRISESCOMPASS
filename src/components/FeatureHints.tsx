import React, { useState, useEffect } from 'react'

/**
 * FeatureHints - Guided feature highlights for first-time users
 * Displays subtle tooltips pointing to key elements
 * Hides after first interaction to avoid clutter
 */
interface FeatureHintsProps {
  visible: boolean
  onInteraction: () => void
}

export const FeatureHints: React.FC<FeatureHintsProps> = ({ visible, onInteraction }) => {
  if (!visible) return null

  const hints = [
    {
      position: 'bottom-40 right-6',
      text: '📝 Click here to report an emergency and help others',
      arrow: 'bottom'
    },
    {
      position: 'bottom-24 right-6',
      text: '🚨 SOS sends your location instantly to responders',
      arrow: 'bottom'
    },
    {
      position: 'bottom-8 right-6',
      text: '🤖 Get AI-powered safety advice in any crisis',
      arrow: 'bottom'
    }
  ]

  return (
    <>
      {hints.map((hint, index) => (
        <div
          key={index}
          className={`absolute ${hint.position} bg-yellow-100 border border-yellow-400 rounded-lg p-2 text-xs text-yellow-800 shadow-lg z-20 max-w-xs animate-pulse pointer-events-none`}
        >
          <p>{hint.text}</p>
        </div>
      ))}

      <div className="fixed inset-0 z-10 opacity-0" onClick={onInteraction}></div>
    </>
  )
}