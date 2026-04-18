import { useState, useEffect } from "react"
import { incidentService, Incident } from "../lib/incidentService"
import { IncidentSummarizer } from "../components/IncidentSummarizer"
import { TimelineView } from "../components/TimelineView"
import { AlertPanel } from "../components/AlertPanel"

// Responder dashboard for incident management
// Features: Filtering, status updates, distance-based sorting
export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user location for distance calculation
    navigator.geolocation.getCurrentPosition(pos => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })

    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    setLoading(true)
    const data = await incidentService.getIncidents()
    setIncidents(data)
    setLoading(false)
  }

  const updateStatus = async (id: string, status: 'active' | 'resolved') => {
    setLoading(true)
    const success = await incidentService.updateIncidentStatus(id, status)
    if (success) {
      setIncidents(prev => prev.map(inc =>
        inc.id === id ? { ...inc, status } : inc
      ))
    }
    setLoading(false)
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const filteredIncidents = incidents.filter(inc =>
    filter === 'all' || inc.type === filter
  ).sort((a, b) => {
    if (!userLocation) return 0
    const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude)
    const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
    return distA - distB
  })

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fire': return 'bg-red-100 text-red-800'
      case 'flood': return 'bg-blue-100 text-blue-800'
      case 'medical': return 'bg-green-100 text-green-800'
      case 'sos': return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl mb-4">Responder Dashboard</h1>

      {/* Crisis Intelligence Summary */}
      <div className="mb-6">
        <IncidentSummarizer />
      </div>

      {/* Incident Timeline */}
      <div className="mb-6">
        <TimelineView />
      </div>

      {/* Emergency Alerts */}
      <div className="mb-6">
        <AlertPanel userLocation={userLocation || undefined} />
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          className="p-2 text-black rounded"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All Incidents</option>
          <option value="fire">Fire</option>
          <option value="flood">Flood</option>
          <option value="medical">Medical</option>
          <option value="sos">SOS</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading incidents...</div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map(incident => (
            <div key={incident.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-sm ${getTypeColor(incident.type)}`}>
                    {incident.type.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(incident.status)}`}>
                    {incident.status || 'active'}
                  </span>
                </div>
                {userLocation && (
                  <span className="text-sm text-gray-400">
                    {calculateDistance(userLocation.lat, userLocation.lng, incident.latitude, incident.longitude).toFixed(1)} km away
                  </span>
                )}
              </div>

              <p className="text-sm mb-2">{incident.description}</p>

              <div className="text-xs text-gray-400 mb-3">
                {new Date(incident.created_at!).toLocaleString()}
              </div>

              {incident.status !== 'resolved' && (
                <button
                  onClick={() => updateStatus(incident.id!, 'resolved')}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Mark Resolved'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}