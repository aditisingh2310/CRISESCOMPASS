import React, { useState, useEffect } from 'react'
import { getIncidents, getIncidentStats } from '../lib/incidentService'

interface DataVisualizationProps {
  className?: string
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<any>(null)
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<string>('7d')

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsData, incidentsData] = await Promise.all([
        getIncidentStats(),
        getIncidents()
      ])
      setStats(statsData)
      setIncidents(incidentsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIncidentsByTimeRange = () => {
    const now = Date.now()
    const ranges = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'all': Infinity
    }

    const cutoff = now - (ranges[timeRange as keyof typeof ranges] || Infinity)
    return incidents.filter(inc => new Date(inc.created_at).getTime() > cutoff)
  }

  const getIncidentsByType = () => {
    const filtered = getIncidentsByTimeRange()
    return filtered.reduce((acc, inc) => {
      acc[inc.type] = (acc[inc.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const getIncidentsOverTime = () => {
    const filtered = getIncidentsByTimeRange()
    const grouped: Record<string, number> = {}

    filtered.forEach(inc => {
      const date = new Date(inc.created_at).toISOString().split('T')[0]
      grouped[date] = (grouped[date] || 0) + 1
    })

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14) // Last 14 days
  }

  const getTopLocations = () => {
    const filtered = getIncidentsByTimeRange()
    const locationCounts: Record<string, number> = {}

    filtered.forEach(inc => {
      const location = inc.location_description ||
        `${inc.latitude.toFixed(2)}, ${inc.longitude.toFixed(2)}`
      locationCounts[location] = (locationCounts[location] || 0) + 1
    })

    return Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  }

  const renderBarChart = (data: [string, number][], title: string, color: string = 'bg-blue-500') => {
    const maxValue = Math.max(...data.map(([, value]) => value))

    return (
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map(([label, value]) => (
            <div key={label} className="flex items-center space-x-3">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate capitalize">
                    {label}
                  </span>
                  <span className="text-sm text-gray-500">{value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTimeChart = (data: [string, number][], title: string) => {
    const maxValue = Math.max(...data.map(([, value]) => value))

    return (
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-end space-x-1 h-32">
          {data.map(([date, value]) => (
            <div key={date} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{
                  height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`,
                  minHeight: value > 0 ? '4px' : '0px'
                }}
              ></div>
              <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const incidentsByType = Object.entries(getIncidentsByType())
  const incidentsOverTime = getIncidentsOverTime()
  const topLocations = getTopLocations()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Time Range Selector */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Type */}
        {renderBarChart(incidentsByType, 'Incidents by Type', 'bg-blue-500')}

        {/* Top Affected Areas */}
        {renderBarChart(topLocations, 'Most Affected Areas', 'bg-red-500')}

        {/* Incidents Over Time */}
        {renderTimeChart(incidentsOverTime, 'Incidents Over Time')}

        {/* Summary Stats */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getIncidentsByTimeRange().length}
              </div>
              <div className="text-sm text-gray-600">Total Incidents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats?.byStatus?.resolved || 0}
              </div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats?.bySeverity?.high || 0}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats?.bySeverity?.critical || 0}
              </div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}