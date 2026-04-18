
import { useState, useEffect } from "react"
import { incidentService, Incident } from "../lib/incidentService"
import { incidentUtils } from "../lib/incidentUtils"

// Incident reporting form with intelligent categorization
// Features: Auto-detection of incident type, offline queuing, location capture
export default function Report() {
  const [description, setDescription] = useState("")
  const [type, setType] = useState("fire")
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    // Get user location
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => setError("Location access denied. Please enable location services.")
    )

    // Monitor online status
    const handleOnline = () => {
      setIsOnline(true)
      // Try to sync queued incidents when coming back online
      incidentService.syncQueuedIncidents().then(() => {
        setPendingCount(incidentService.getQueuedIncidentsCount())
      })
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial pending count
    setPendingCount(incidentService.getQueuedIncidentsCount())

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const submit = async () => {
    if (!description.trim() || !location) {
      setError("Please provide a description and allow location access.")
      return
    }

    setLoading(true)
    setError("")

    const incident: Omit<Incident, 'id' | 'created_at'> = {
      type: type === 'auto' ? incidentUtils.categorizeIncident(description.trim()) : type,
      description: description.trim(),
      latitude: location.lat,
      longitude: location.lng
    }

    const result = await incidentService.submitIncident(incident)

    setLoading(false)

    if (result) {
      setSuccess(true)
      setDescription("")
      setTimeout(() => setSuccess(false), 3000)
      setPendingCount(incidentService.getQueuedIncidentsCount())
    } else {
      if (!isOnline) {
        setSuccess(true)
        setDescription("")
        setTimeout(() => setSuccess(false), 3000)
        setPendingCount(incidentService.getQueuedIncidentsCount())
      } else {
        setError("Failed to submit report. Please try again.")
      }
    }
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl mb-4">Report Incident</h1>

      {!isOnline && (
        <div className="bg-yellow-600 p-2 mb-4 rounded">
          You're offline. Reports will be queued and sent when connection returns.
          {pendingCount > 0 && <span className="block mt-1">Pending reports: {pendingCount}</span>}
        </div>
      )}

      {error && <div className="bg-red-600 p-2 mb-4 rounded">{error}</div>}
      {success && (
        <div className="bg-green-600 p-2 mb-4 rounded">
          {isOnline ? "Report submitted successfully!" : "Report queued for submission when online!"}
        </div>
      )}

      <select
        className="w-full p-2 mb-4 text-black rounded"
        value={type}
        onChange={e => setType(e.target.value)}
      >
        <option value="auto">Auto-detect from description</option>
        <option value="fire">Fire</option>
        <option value="flood">Flood</option>
        <option value="medical">Medical Emergency</option>
        <option value="shelter">Need Shelter</option>
        <option value="infrastructure">Infrastructure Issue</option>
        <option value="sos">SOS Emergency</option>
        <option value="other">Other</option>
      </select>

      <textarea
        className="w-full p-2 mb-4 text-black rounded"
        placeholder="Describe the incident"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={4}
      />

      {location && (
        <p className="text-sm mb-4">
          Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      )}

      <button
        className="w-full bg-red-600 p-3 rounded disabled:opacity-50"
        onClick={submit}
        disabled={loading || !location}
      >
        {loading ? "Submitting..." : "Submit Report"}
      </button>
    </div>
  )
}
