/**
 * HomeMap - Main crisis coordination interface
 * Redesigned for maximum impact in 10 seconds
 * 
 * UX Strategy:
 * 1. Hero panel explains the platform instantly
 * 2. Three action buttons for main functions
 * 3. Live stats show the system is active
 * 4. Map legend explains colors immediately
 * 5. Feature hints guide first-time users
 * 6. Empty state encourages demo mode or action
 * 7. Impact metrics communicate value
 * 
 * Map remains the centerpiece with minimal UI overlay
 */
import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import { incidentService, Incident } from "../lib/incidentService"
import { resources } from "../data/mockResources"
import { demoSimulation } from "../lib/demoSimulation"
import { incidentUtils } from "../lib/incidentUtils"
import { notificationManager } from "../lib/notificationManager"

// UX Components
import { HeroPanel } from "../components/HeroPanel"
import { ActionButtons } from "../components/ActionButtons"
import { IncidentLegend } from "../components/IncidentLegend"
import { LiveStatsPanel } from "../components/LiveStatsPanel"
import { ImpactMetrics } from "../components/ImpactMetrics"
import { FeatureHints } from "../components/FeatureHints"
import { EmptyStateHint } from "../components/EmptyStateHint"

export default function HomeMap() {
  // Map refs
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  // State
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [demoMode, setDemoMode] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [sosLoading, setSosLoading] = useState(false)

  // UX State
  const [showHero, setShowHero] = useState(true)
  const [showHints, setShowHints] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)

  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Marker color scheme
  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'fire': return '#ef4444'
      case 'flood': return '#3b82f6'
      case 'medical': return '#10b981'
      case 'shelter': return '#f59e0b'
      case 'sos': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥'
      case 'shelter': return '🏠'
      case 'police': return '🚔'
      default: return '📍'
    }
  }

  // Fetch incidents from Supabase
  const fetchIncidents = async () => {
    try {
      const data = await incidentService.getIncidents()
      setIncidents(data)
    } catch (error) {
      console.error('Failed to fetch incidents:', error)
      setIncidents([])
    }
  }

  // Add incident markers to map with clustering
  const addIncidentMarkers = () => {
    if (!mapInstance.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Cluster incidents for better visualization
    const clusteredIncidents = incidentUtils.clusterIncidents(incidents, 0.5)

    clusteredIncidents.forEach(item => {
      if (item.isCluster) {
        // Cluster marker
        const el = document.createElement('div')
        el.className = 'w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-sm font-bold bg-purple-600 text-white'
        el.innerHTML = item.count.toString()

        const marker = new mapboxgl.Marker(el)
          .setLngLat([item.longitude, item.latitude])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2"><h3 class="font-bold">Incident Cluster</h3><p class="text-sm">${item.count} incidents in this area</p></div>
          `))
          .addTo(mapInstance.current!)

        markersRef.current.push(marker)
      } else {
        // Single incident marker
        const el = document.createElement('div')
        el.className = 'w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold'
        el.style.backgroundColor = getMarkerColor(item.type)
        el.innerHTML = item.type.charAt(0).toUpperCase()

        const marker = new mapboxgl.Marker(el)
          .setLngLat([item.longitude, item.latitude])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-bold capitalize">${item.type}</h3>
              <p class="text-sm">${item.description}</p>
              <p class="text-xs text-gray-500">${new Date(item.created_at!).toLocaleString()}</p>
            </div>
          `))
          .addTo(mapInstance.current!)

        // Animate entrance
        el.style.transform = 'scale(0)'
        el.style.transition = 'transform 0.3s ease-out'
        setTimeout(() => {
          el.style.transform = 'scale(1)'
        }, 100)

        markersRef.current.push(marker)
      }
    })
  }

  // Add resource markers
  const addResourceMarkers = () => {
    if (!mapInstance.current) return

    resources.forEach(resource => {
      const el = document.createElement('div')
      el.className = 'text-2xl'
      el.innerHTML = getResourceIcon(resource.type)

      new mapboxgl.Marker(el)
        .setLngLat([resource.lng, resource.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h3 class="font-bold">${resource.name}</h3>
            <p class="text-sm capitalize">${resource.type}</p>
          </div>
        `))
        .addTo(mapInstance.current!)
    })
  }

  // Handle SOS emergency
  const handleSOS = async () => {
    if (!userLocation) {
      setNotification('📍 Location unavailable for SOS')
      return
    }

    setSosLoading(true)

    const sosIncident: Omit<Incident, 'id' | 'created_at'> = {
      type: 'sos',
      description: 'EMERGENCY SOS - Immediate assistance required!',
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      severity: 'critical'
    }

    try {
      const result = await incidentService.submitIncident(sosIncident)
      if (result) {
        // Add flashing marker
        const el = document.createElement('div')
        el.className = 'w-8 h-8 rounded-full border-4 border-red-500 bg-red-600 animate-pulse'
        el.innerHTML = '🚨'

        const marker = new mapboxgl.Marker(el)
          .setLngLat([userLocation.lng, userLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<div class="p-2"><h3 class="font-bold text-red-600">🚨 SOS ALERT</h3><p>Emergency assistance requested</p></div>'))
          .addTo(mapInstance.current!)

        markersRef.current.push(marker)

        setNotification('🚨 SOS ALERT sent! Emergency services have been notified.')
        setTimeout(() => setNotification(null), 5000)
      }
    } catch (error) {
      console.error('SOS error:', error)
      setNotification('⚠️ Failed to send SOS. Please try again.')
    } finally {
      setSosLoading(false)
    }
  }

  // Toggle heatmap visualization
  const toggleHeatmap = () => {
    if (!mapInstance.current) return

    setShowHeatmap(!showHeatmap)

    if (!showHeatmap) {
      // Add heatmap
      mapInstance.current.addSource('incidents-heat', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: incidents.map(incident => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [incident.longitude, incident.latitude]
            },
            properties: { type: incident.type }
          }))
        }
      })

      mapInstance.current.addLayer({
        id: 'incidents-heat',
        type: 'heatmap',
        source: 'incidents-heat',
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': 20,
          'heatmap-opacity': 0.7
        }
      })
    } else {
      // Remove heatmap
      if (mapInstance.current.getLayer('incidents-heat')) {
        mapInstance.current.removeLayer('incidents-heat')
      }
      if (mapInstance.current.getSource('incidents-heat')) {
        mapInstance.current.removeSource('incidents-heat')
      }
    }
  }

  // Initialize map and subscriptions
  useEffect(() => {
    mapboxgl.accessToken = "YOUR_MAPBOX_TOKEN"

    const map = new mapboxgl.Map({
      container: mapRef.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [77.2090, 28.6139],
      zoom: 12
    })

    mapInstance.current = map

    // Get user location
    navigator.geolocation.getCurrentPosition(
      pos => {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(location)

        new mapboxgl.Marker({ color: '#00ff00' })
          .setLngLat([location.lng, location.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<div class="p-2"><h3 class="font-bold">Your Location</h3></div>'))
          .addTo(map)
      },
      () => {
        console.log('Geolocation not available')
      }
    )

    // Add resource markers
    addResourceMarkers()

    // Fetch incidents
    fetchIncidents()

    // Subscribe to realtime updates
    const subscription = incidentService.subscribeToIncidents((newIncident) => {
      setIncidents(prev => [newIncident, ...prev])
      if (newIncident.type === 'sos') {
        notificationManager.notify(`🚨 URGENT SOS ALERT! Immediate assistance required!`)
      }
      setShowHints(false) // Hide hints on first incident
    })

    // Subscribe to notifications
    const unsubscribeNotifications = notificationManager.subscribe((message) => {
      setNotification(message)
      setTimeout(() => setNotification(null), 5000)
    })

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchIncidents, 30000)

    // Handle online/offline
    const handleOnline = () => {
      notificationManager.notify('📡 Connection restored!')
    }
    window.addEventListener('online', handleOnline)

    return () => {
      clearInterval(interval)
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
      subscription.unsubscribe()
      unsubscribeNotifications()
      window.removeEventListener('online', handleOnline)
      map.remove()
    }
  }, [])

  // Update markers when incidents change
  useEffect(() => {
    addIncidentMarkers()
  }, [incidents])

  return (
    <div className="h-screen w-full relative" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Map */}
      <div ref={mapRef} className="h-full w-full" />

      {/* 10-Second Hero Panel */}
      <HeroPanel visible={showHero} onDismiss={() => setShowHero(false)} />

      {/* Feature Hints - Guide first-time users */}
      <FeatureHints
        visible={showHints && !showHero}
        onInteraction={() => setShowHints(false)}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-20 left-4 right-4 max-w-sm bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-lg shadow-xl z-10 border-l-4 border-red-300 animate-fadeIn">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚨</span>
            <p className="flex-1">{notification}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-red-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Left Panel - Legend & Stats */}
      <div className="absolute top-4 left-4 w-72 space-y-4 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <IncidentLegend />
        </div>
        <div className="pointer-events-auto">
          <LiveStatsPanel incidents={incidents} />
        </div>
        <div className="pointer-events-auto">
          <ImpactMetrics incidentCount={incidents.length} />
        </div>
      </div>

      {/* Right Panel - Options & Heatmap Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-white rounded-lg shadow-lg p-3 space-y-2">
          <button
            onClick={toggleHeatmap}
            className={`w-full px-4 py-2 rounded font-medium text-sm transition-colors ${
              showHeatmap
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {showHeatmap ? '🔥 Heatmap On' : '🔥 Heatmap Off'}
          </button>

          {!demoMode ? (
            <button
              onClick={() => {
                setDemoMode(true)
                if (userLocation) {
                  let step = 0
                  const demoSteps = [
                    '🎭 Welcome to CrisisConnect Demo!',
                    '📍 Watch incidents appear in real-time',
                    '🗺️ Notice incident colors and types',
                    '⚠️ Emergency alerts are broadcast automatically'
                  ]

                  demoIntervalRef.current = setInterval(() => {
                    if (step < demoSteps.length) {
                      notificationManager.notify(demoSteps[step])
                      if (step % 2 === 0) {
                        const mockIncident = demoSimulation.generateScenario(userLocation)
                        setIncidents(prev => [mockIncident, ...prev])
                      }
                      step++
                    } else {
                      clearInterval(demoIntervalRef.current!)
                      setDemoMode(false)
                    }
                  }, 6000)
                }
              }}
              className="w-full px-4 py-2 rounded font-medium text-sm bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              🎮 Demo Mode
            </button>
          ) : (
            <button
              onClick={() => {
                setDemoMode(false)
                if (demoIntervalRef.current) {
                  clearInterval(demoIntervalRef.current)
                  demoIntervalRef.current = null
                }
                fetchIncidents()
              }}
              className="w-full px-4 py-2 rounded font-medium text-sm bg-purple-100 text-purple-800 border border-purple-400"
            >
              ✓ Demo Active
            </button>
          )}
        </div>
      </div>

      {/* Main Action Buttons - Floating */}
      <ActionButtons onSOS={handleSOS} sosLoading={sosLoading} />

      {/* Empty State - Show when no incidents */}
      {incidents.length === 0 && !demoMode && (
        <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
          <div className="pointer-events-auto">
            <EmptyStateHint
              onEnableDemoMode={() => setDemoMode(true)}
              demoModeEnabled={demoMode}
            />
          </div>
        </div>
      )}
    </div>
  )
}
/**
 * HomeMap - Main crisis coordination interface
 * Redesigned for maximum impact in 10 seconds
 * 
 * UX Strategy:
 * 1. Hero panel explains the platform instantly
 * 2. Three action buttons for main functions
 * 3. Live stats show the system is active
 * 4. Map legend explains colors immediately
 * 5. Feature hints guide first-time users
 * 6. Empty state encourages demo mode or action
 * 7. Impact metrics communicate value
 * 
 * Map remains the centerpiece with minimal UI overlay
 */
import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import { incidentService, Incident } from "../lib/incidentService"
import { resources } from "../data/mockResources"
import { demoSimulation } from "../lib/demoSimulation"
import { incidentUtils } from "../lib/incidentUtils"
import { notificationManager } from "../lib/notificationManager"

// UX Components
import { HeroPanel } from "../components/HeroPanel"
import { ActionButtons } from "../components/ActionButtons"
import { IncidentLegend } from "../components/IncidentLegend"
import { LiveStatsPanel } from "../components/LiveStatsPanel"
import { ImpactMetrics } from "../components/ImpactMetrics"
import { FeatureHints } from "../components/FeatureHints"
import { EmptyStateHint } from "../components/EmptyStateHint"

export default function HomeMap() {
  // Map refs
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  // State
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [demoMode, setDemoMode] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [sosLoading, setSosLoading] = useState(false)

  // UX State
  const [showHero, setShowHero] = useState(true)
  const [showHints, setShowHints] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)

  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Marker color scheme
  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'fire': return '#ef4444'
      case 'flood': return '#3b82f6'
      case 'medical': return '#10b981'
      case 'shelter': return '#f59e0b'
      case 'sos': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥'
      case 'shelter': return '🏠'
      case 'police': return '🚔'
      default: return '📍'
    }
  }

  // Fetch incidents from Supabase
  const fetchIncidents = async () => {
    try {
      const data = await incidentService.getIncidents()
      setIncidents(data)
    } catch (error) {
      console.error('Failed to fetch incidents:', error)
      setIncidents([])
    }
  }

  // Add incident markers to map with clustering
  const addIncidentMarkers = () => {
    if (!mapInstance.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Cluster incidents for better visualization
    const clusteredIncidents = incidentUtils.clusterIncidents(incidents, 0.5)

    clusteredIncidents.forEach(item => {
      if (item.isCluster) {
        // Cluster marker
        const el = document.createElement('div')
        el.className = 'w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-sm font-bold bg-purple-600 text-white'
        el.innerHTML = item.count.toString()

        const marker = new mapboxgl.Marker(el)
          .setLngLat([item.longitude, item.latitude])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2"><h3 class="font-bold">Incident Cluster</h3><p class="text-sm">${item.count} incidents here</p></div>
          `))
          .addTo(mapInstance.current!)

        markersRef.current.push(marker)
      } else {
        // Single incident marker
        const el = document.createElement('div')
        el.className = 'w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold'
        el.style.backgroundColor = getMarkerColor(item.type)
        el.innerHTML = item.type.charAt(0).toUpperCase()

        const marker = new mapboxgl.Marker(el)
          .setLngLat([item.longitude, item.latitude])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-bold capitalize">${item.type}</h3>
              <p class="text-sm">${item.description}</p>
              <p class="text-xs text-gray-500">${new Date(item.created_at!).toLocaleString()}</p>
            </div>
          `))
          .addTo(mapInstance.current!)

        // Animate entrance
        el.style.transform = 'scale(0)'
        el.style.transition = 'transform 0.3s ease-out'
        setTimeout(() => {
          el.style.transform = 'scale(1)'
        }, 100)

        markersRef.current.push(marker)
      }
    })
  }

  // Add resource markers
  const addResourceMarkers = () => {
    if (!mapInstance.current) return

    resources.forEach(resource => {
      const el = document.createElement('div')
      el.className = 'text-2xl'
      el.innerHTML = getResourceIcon(resource.type)

      new mapboxgl.Marker(el)
        .setLngLat([resource.lng, resource.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h3 class="font-bold">${resource.name}</h3>
            <p class="text-sm capitalize">${resource.type}</p>
          </div>
        `))
        .addTo(mapInstance.current!)
    })
  }

  // Handle SOS emergency
  const handleSOS = async () => {
    if (!userLocation) {
      setNotification('📍 Location not available for SOS')
      return
    }

    setSosLoading(true)

    const sosIncident: Omit<Incident, 'id' | 'created_at'> = {
      type: 'sos',
      description: 'EMERGENCY SOS - Immediate assistance required!',
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      severity: 'critical'
    }

    try {
      const result = await incidentService.submitIncident(sosIncident)
      if (result) {
        // Add flashing marker
        const el = document.createElement('div')
        el.className = 'w-8 h-8 rounded-full border-4 border-red-500 bg-red-600 animate-pulse'
        el.innerHTML = '🚨'

        const marker = new mapboxgl.Marker(el)
          .setLngLat([userLocation.lng, userLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<div class="p-2"><h3 class="font-bold text-red-600">🚨 SOS ALERT</h3><p>Emergency assistance requested</p></div>'))
          .addTo(mapInstance.current!)

        markersRef.current.push(marker)

        setNotification('🚨 SOS ALERT sent! Emergency services have been notified.')
        setTimeout(() => setNotification(null), 5000)
      }
    } catch (error) {
      console.error('SOS error:', error)
      setNotification('⚠️ Failed to send SOS. Please try again.')
    } finally {
      setSosLoading(false)
    }
  }

  // Toggle heatmap visualization
  const toggleHeatmap = () => {
    if (!mapInstance.current) return

    setShowHeatmap(!showHeatmap)

    if (!showHeatmap) {
      // Add heatmap
      mapInstance.current.addSource('incidents-heat', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: incidents.map(incident => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [incident.longitude, incident.latitude]
            },
            properties: { type: incident.type }
          }))
        }
      })

      mapInstance.current.addLayer({
        id: 'incidents-heat',
        type: 'heatmap',
        source: 'incidents-heat',
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': 20,
          'heatmap-opacity': 0.7
        }
      })
    } else {
      // Remove heatmap
      if (mapInstance.current.getLayer('incidents-heat')) {
        mapInstance.current.removeLayer('incidents-heat')
      }
      if (mapInstance.current.getSource('incidents-heat')) {
        mapInstance.current.removeSource('incidents-heat')
      }
    }
  }

        const marker = new mapboxgl.Marker(el)
          .setLngLat([item.longitude, item.latitude])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-bold capitalize">${item.type}</h3>
              <p class="text-sm">${item.description}</p>
              <p class="text-xs text-gray-500">${new Date(item.created_at!).toLocaleString()}</p>
            </div>
          `))
          .addTo(mapInstance.current!)

        // Add entrance animation
        el.style.transform = 'scale(0)'
        el.style.transition = 'transform 0.3s ease-out'
        setTimeout(() => {
          el.style.transform = 'scale(1)'
        }, 100)

        markersRef.current.push(marker)
      }
    })
  }

  const addResourceMarkers = () => {
    if (!mapInstance.current) return

    resources.forEach(resource => {
      const el = document.createElement('div')
      el.className = 'text-2xl'
      el.innerHTML = getResourceIcon(resource.type)

      new mapboxgl.Marker(el)
        .setLngLat([resource.lng, resource.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h3 class="font-bold">${resource.name}</h3>
            <p class="text-sm capitalize">${resource.type}</p>
          </div>
        `))
        .addTo(mapInstance.current!)
    })
  }

  // Emergency SOS - creates high-priority incident and alerts nearby users
  const handleSOS = async () => {
    if (!userLocation) {
      alert('Location not available for SOS')
      return
    }

    const sosIncident: Omit<Incident, 'id' | 'created_at'> = {
      type: 'sos',
      description: 'EMERGENCY SOS - Immediate assistance required!',
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      priority: 'high'
    }

    const result = await incidentService.submitIncident(sosIncident)
    if (result) {
      // Add flashing marker
      const el = document.createElement('div')
      el.className = 'w-8 h-8 rounded-full border-4 border-red-500 bg-red-600 animate-pulse'
      el.innerHTML = '🚨'

      const marker = new mapboxgl.Marker(el)
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<div class="p-2"><h3 class="font-bold text-red-600">SOS ALERT</h3><p>Emergency assistance requested</p></div>'))
        .addTo(mapInstance.current!)

      markersRef.current.push(marker)

      notificationManager.notify('🚨 SOS ALERT sent! Emergency services have been notified.')

      setNotification('SOS sent! Help is on the way.')
      setTimeout(() => setNotification(null), 5000)
    }
  }

  useEffect(() => {
    mapboxgl.accessToken = "YOUR_MAPBOX_TOKEN"

    const map = new mapboxgl.Map({
      container: mapRef.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [77.2090, 28.6139],
      zoom: 12
    })

    mapInstance.current = map

    // Add user location marker
    navigator.geolocation.getCurrentPosition(pos => {
      const location = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setUserLocation(location)
      setEmergencyContacts(getEmergencyContacts(location.lat, location.lng))

      new mapboxgl.Marker({ color: '#00ff00' })
        .setLngLat([location.lng, location.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<div class="p-2"><h3 class="font-bold">Your Location</h3></div>'))
        .addTo(map)
    }, () => {
      // Handle geolocation error gracefully
      setEmergencyContacts(getEmergencyContacts())
    })

    // Add resource markers
    addResourceMarkers()

    // Initial fetch
    fetchIncidents()

    // Setup realtime subscription
    const subscription = incidentService.subscribeToIncidents((newIncident) => {
      try {
        setIncidents(prev => {
          const updated = [newIncident, ...prev]
          setCrisisSummary(incidentUtils.getCrisisSummary(updated))
          return updated
        })

        // Notify about new incident
        if (userLocation) {
          const distance = incidentUtils.calculateDistance(
            userLocation.lat, userLocation.lng,
            newIncident.latitude, newIncident.longitude
          )
          if (distance <= 5) { // Within 5km
            if (newIncident.type === 'sos') {
              notificationManager.notify(`🚨 URGENT SOS ALERT ${distance.toFixed(1)}km away! Immediate assistance needed!`)
            } else {
              notificationManager.notify(`🚨 New ${newIncident.type} incident reported ${distance.toFixed(1)}km away!`)
            }
          }
        }

        // Animate new marker
        setTimeout(() => {
          const newMarkers = markersRef.current.filter(m => {
            const lngLat = m.getLngLat()
            return Math.abs(lngLat.lat - newIncident.latitude) < 0.001 &&
                   Math.abs(lngLat.lng - newIncident.longitude) < 0.001
          })
          if (newMarkers.length > 0) {
            const el = newMarkers[0].getElement()
            el.classList.add('animate-bounce')
            setTimeout(() => el.classList.remove('animate-bounce'), 2000)
          }
        }, 100)
      } catch (error) {
        console.error('Error handling realtime incident:', error)
      }
    })

    // Subscribe to notifications
    const unsubscribeNotifications = notificationManager.subscribe((message) => {
      setNotification(message)
      setTimeout(() => setNotification(null), 5000)
    })

    // Auto-refresh every 30 seconds (reduced frequency since we have realtime)
    const interval = setInterval(fetchIncidents, 30000)

    // Monitor connectivity
    const handleOnline = () => {
      notificationManager.notify('📡 Connection restored! Syncing offline reports...')
      // Sync will be handled by incidentService
    }
    window.addEventListener('online', handleOnline)

    return () => {
      clearInterval(interval)
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current)
      }
      subscription.unsubscribe()
      unsubscribeNotifications()
      window.removeEventListener('online', handleOnline)
      map.remove()
    }
  }, [])

  const toggleHeatmap = () => {
    if (!mapInstance.current) return

    setShowHeatmap(!showHeatmap)

    if (!showHeatmap) {
      // Add heatmap layer
      mapInstance.current.addSource('incidents-heat', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: incidents.map(incident => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [incident.longitude, incident.latitude]
            },
            properties: {
              type: incident.type
            }
          }))
        }
      })

      mapInstance.current.addLayer({
        id: 'incidents-heat',
        type: 'heatmap',
        source: 'incidents-heat',
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': 20,
          'heatmap-opacity': 0.7
        }
      })
    } else {
      // Remove heatmap layer
      if (mapInstance.current.getLayer('incidents-heat')) {
        mapInstance.current.removeLayer('incidents-heat')
      }
      if (mapInstance.current.getSource('incidents-heat')) {
        mapInstance.current.removeSource('incidents-heat')
      }
    }
  }

  return (
    <div className="h-screen w-full relative" style={{ height: 'calc(100vh - 80px)' }}>
      <div ref={mapRef} className="h-full w-full" />

      {/* Notification */}
      {notification && (
        <div className="absolute top-20 left-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-lg shadow-xl z-10 border-l-4 border-red-300 animate-fade-in">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚨</span>
            <p className="flex-1">{notification}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-red-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Crisis Summary Panel */}
      {crisisSummary && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded shadow-lg max-w-xs">
          <h3 className="font-bold mb-2">Crisis Summary</h3>
          <div className="space-y-1 text-sm">
            <p>Total Incidents: <span className="font-semibold">{crisisSummary.total}</span></p>
            <div>
              <p className="font-semibold">By Type:</p>
              {Object.entries(crisisSummary.byType).map(([type, count]) => (
                <p key={type} className="ml-2">• {type}: {count}</p>
              ))}
            </div>
            {crisisSummary.latest && (
              <p>Latest: <span className="font-semibold">{crisisSummary.latest.type}</span></p>
            )}
          </div>
        </div>
      )}

      {/* Emergency Contacts Panel */}
      {showEmergencyContacts && emergencyContacts && (
        <div className="absolute bottom-20 left-4 bg-white p-4 rounded shadow-lg">
          <h3 className="font-bold mb-2">Emergency Contacts</h3>
          <div className="space-y-1 text-sm">
            <p>🚑 Ambulance: <a href={`tel:${emergencyContacts.ambulance}`} className="text-blue-600 hover:underline">{emergencyContacts.ambulance}</a></p>
            <p>🚔 Police: <a href={`tel:${emergencyContacts.police}`} className="text-blue-600 hover:underline">{emergencyContacts.police}</a></p>
            <p>🚒 Fire: <a href={`tel:${emergencyContacts.fire}`} className="text-blue-600 hover:underline">{emergencyContacts.fire}</a></p>
          </div>
          <button
            onClick={() => setShowEmergencyContacts(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="bg-white p-2 rounded shadow-lg">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => {
                const enabled = e.target.checked
                setDemoMode(enabled)

                if (enabled && userLocation) {
                  // Start guided demo
                  let step = 0
                  const demoSteps = [
                    'Welcome to CrisisConnect! Watch as we simulate a disaster scenario.',
                    'Incidents are appearing on the map in real-time.',
                    'Notice the different colored markers for different incident types.',
                    'Try the heatmap toggle to see incident density.',
                    'Emergency contacts are available - tap the phone icon.',
                    'The crisis summary panel shows live statistics.',
                    'Demo complete! CrisisConnect is ready to help during real emergencies.'
                  ]

                  demoIntervalRef.current = setInterval(() => {
                    if (step < demoSteps.length) {
                      notificationManager.notify(`🎭 ${demoSteps[step]}`)
                      step++
                    }

                    // Generate incident every other step
                    if (step % 2 === 0) {
                      const mockIncident = demoSimulation.generateScenario(userLocation)
                      setIncidents(prev => [mockIncident, ...prev])
                    }

                    if (step >= demoSteps.length) {
                      clearInterval(demoIntervalRef.current!)
                      demoIntervalRef.current = null
                      notificationManager.notify('🎭 Demo complete! Toggle off demo mode to return to live data.')
                    }
                  }, 8000) // Every 8 seconds
                } else {
                  // Stop demo
                  if (demoIntervalRef.current) {
                    clearInterval(demoIntervalRef.current)
                    demoIntervalRef.current = null
                  }
                  fetchIncidents()
                }
              }}
            />
            <span className="text-sm">Guided Demo</span>
          </label>
        </div>

        <div className="bg-white p-2 rounded shadow-lg">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={toggleHeatmap}
            />
            <span className="text-sm">Heatmap</span>
          </label>
        </div>
      </div>

      {/* SOS Button */}
      <button
        onClick={handleSOS}
        className="absolute bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg animate-pulse"
        title="Emergency SOS"
      >
        🚨 SOS
      </button>

      {/* Quick Report FAB */}
      <Link
        to="/report"
        className="absolute bottom-6 left-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
        title="Report Incident"
      >
        📝
      </Link>

      {/* Emergency Contacts FAB */}
      <button
        onClick={() => setShowEmergencyContacts(!showEmergencyContacts)}
        className="absolute bottom-6 left-20 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
        title="Emergency Contacts"
      >
        📞
      </button>
    </div>
  )
}
