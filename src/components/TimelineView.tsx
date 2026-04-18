import React, { useState, useEffect } from 'react'
import { getIncidents, Incident } from '../lib/incidentService'

interface TimelineViewProps {
  className?: string
}

export const TimelineView: React.FC<TimelineViewProps> = ({ className = '' }) => {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('24h')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIncidents()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [incidents, filter, timeRange])

  const fetchIncidents = async () => {
    setLoading(true)
    try {
      const data = await getIncidents()
      setIncidents(data.sort((a, b) =>
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      ))
    } catch (error) {
      console.error('Failed to fetch incidents:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...incidents]

    // Time range filter
    const now = Date.now()
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      'all': Infinity
    }

    const timeLimit = timeRanges[timeRange as keyof typeof timeRanges] || Infinity
    filtered = filtered.filter(inc =>
      now - new Date(inc.created_at!).getTime() <= timeLimit
    )

    // Type filter
    if (filter !== 'all') {
      filtered = filtered.filter(inc => inc.type === filter)
    }

    setFilteredIncidents(filtered)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fire': return 'bg-red-500'
      case 'flood': return 'bg-blue-500'
      case 'medical': return 'bg-green-500'
      case 'sos': return 'bg-red-700'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return `${diffDays}d ago`
    }
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Incident Timeline</h3>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="fire">Fire</option>
              <option value="flood">Flood</option>
              <option value="medical">Medical</option>
              <option value="sos">SOS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading timeline...</div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No incidents found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredIncidents.map((incident, index) => (
              <div key={incident.id} className={`p-4 hover:bg-gray-50 ${getSeverityColor(incident.severity)}`}>
                <div className="flex items-start space-x-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${getTypeColor(incident.type)}`}></div>
                    {index < filteredIncidents.length - 1 && (
                      <div className="w-px h-8 bg-gray-300 mt-2"></div>
                    )}
                  </div>

                  {/* Incident details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {incident.type}
                        </span>
                        {incident.severity && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            incident.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {incident.severity}
                          </span>
                        )}
                        {incident.status && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {incident.status}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(incident.created_at!)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-1">{incident.description}</p>

                    <div className="text-xs text-gray-500">
                      {incident.latitude?.toFixed(4)}, {incident.longitude?.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}