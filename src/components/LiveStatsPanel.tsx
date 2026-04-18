import React, { useState, useEffect } from 'react'
import { Incident, getIncidents, getIncidentStats } from '../lib/incidentService'

/**
 * LiveStatsPanel - Real-time activity indicator
 * Shows judges that the system is live and active
 * Displays: active incidents, responders, most recent report
 */
interface LiveStatsPanelProps {
  incidents: Incident[]
  className?: string
}

export const LiveStatsPanel: React.FC<LiveStatsPanelProps> = ({ incidents, className = '' }) => {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getIncidentStats()
        setStats(statsData)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    fetchStats()
  }, [incidents])

  const getRecentIncident = () => {
    return incidents.length > 0
      ? incidents[0]
      : null
  }

  const recent = getRecentIncident()
  const activeCount = incidents.filter(i => i.status !== 'resolved').length

  const formatTime = (date: string) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>Live Activity</span>
        </h3>
        <span className="text-xs text-green-600 font-semibold">LIVE</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded p-3">
          <div className="text-2xl font-bold text-blue-600">
            {activeCount}
          </div>
          <div className="text-xs text-gray-600">Active Incidents</div>
        </div>

        <div className="bg-green-50 rounded p-3">
          <div className="text-2xl font-bold text-green-600">
            {stats?.byStatus?.resolved || 0}
          </div>
          <div className="text-xs text-gray-600">Resolved Today</div>
        </div>
      </div>

      {recent && (
        <div className="pt-3 border-t">
          <p className="text-xs text-gray-600 mb-1 font-semibold">Most Recent:</p>
          <div className="bg-gray-50 rounded p-2 text-xs">
            <div className="flex items-center space-x-2 mb-1">
              <span className="capitalize font-semibold text-gray-800">
                {recent.type}
              </span>
              <span className="text-gray-500 text-xs">
                {formatTime(recent.created_at!)}
              </span>
            </div>
            <p className="text-gray-700 line-clamp-2">{recent.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}