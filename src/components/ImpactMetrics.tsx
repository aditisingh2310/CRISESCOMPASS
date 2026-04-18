import React, { useState, useEffect } from 'react'

/**
 * ImpactMetrics - Displays simulated impact numbers
 * Communicates the value of CrisisConnect to judges
 * Shows metrics like incidents reported, people assisted, response time
 */
interface ImpactMetricsProps {
  incidentCount: number
  className?: string
}

export const ImpactMetrics: React.FC<ImpactMetricsProps> = ({ incidentCount, className = '' }) => {
  // Simulated metrics for demo (would be real data in production)
  const metrics = [
    {
      label: 'Incidents Reported',
      value: incidentCount,
      unit: '',
      color: 'bg-blue-500',
      icon: '📍'
    },
    {
      label: 'People Assisted',
      value: Math.floor(incidentCount * 3.5),
      unit: '',
      color: 'bg-green-500',
      icon: '👥'
    },
    {
      label: 'Avg Response Time',
      value: '4.2',
      unit: 'min',
      color: 'bg-orange-500',
      icon: '⏱️'
    },
    {
      label: 'System Uptime',
      value: '99.8',
      unit: '%',
      color: 'bg-purple-500',
      icon: '✅'
    }
  ]

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md border p-3">
            <div className="text-2xl mb-1">{metric.icon}</div>
            <div className="text-lg font-bold text-gray-900">
              {metric.value}
              <span className="text-sm text-gray-600">{metric.unit}</span>
            </div>
            <div className="text-xs text-gray-600">{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}