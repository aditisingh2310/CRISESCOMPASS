// Risk prediction and analysis utilities for CrisisConnect
export const riskAnalysis = {
  // Calculate risk score for a geographic area based on incident data
  calculateRiskScore(incidents: any[], centerLat: number, centerLng: number, radiusKm: number = 2): {
    score: number
    level: 'low' | 'medium' | 'high'
    factors: {
      recentIncidents: number
      density: number
      criticalIncidents: number
    }
  } {
    const recentIncidents = incidents.filter(inc => {
      const incidentTime = new Date(inc.created_at).getTime()
      const oneHourAgo = Date.now() - 60 * 60 * 1000
      return incidentTime > oneHourAgo
    })

    const nearbyIncidents = recentIncidents.filter(inc => {
      const distance = this.calculateDistance(centerLat, centerLng, inc.latitude, inc.longitude)
      return distance <= radiusKm
    })

    const criticalIncidents = nearbyIncidents.filter(inc =>
      inc.severity === 'critical' || inc.type === 'sos' || inc.priority === 'high'
    ).length

    const density = nearbyIncidents.length / (Math.PI * radiusKm * radiusKm) // incidents per km²

    // Risk score calculation (0-100)
    const recencyWeight = Math.min(nearbyIncidents.length * 10, 40)
    const densityWeight = Math.min(density * 20, 30)
    const criticalWeight = criticalIncidents * 15

    const score = Math.min(recencyWeight + densityWeight + criticalWeight, 100)

    let level: 'low' | 'medium' | 'high'
    if (score < 30) level = 'low'
    else if (score < 70) level = 'medium'
    else level = 'high'

    return {
      score,
      level,
      factors: {
        recentIncidents: nearbyIncidents.length,
        density,
        criticalIncidents
      }
    }
  },

  // Generate risk zones for the entire map area
  generateRiskZones(incidents: any[], bounds: { north: number, south: number, east: number, west: number }, gridSize: number = 0.01): any[] {
    const zones = []
    const latStep = (bounds.north - bounds.south) / 10
    const lngStep = (bounds.east - bounds.west) / 10

    for (let lat = bounds.south; lat < bounds.north; lat += latStep) {
      for (let lng = bounds.west; lng < bounds.east; lng += lngStep) {
        const risk = this.calculateRiskScore(incidents, lat + latStep/2, lng + lngStep/2, 1)
        if (risk.score > 10) { // Only show zones with some risk
          zones.push({
            center: { lat: lat + latStep/2, lng: lng + lngStep/2 },
            bounds: {
              north: lat + latStep,
              south: lat,
              east: lng + lngStep,
              west: lng
            },
            risk
          })
        }
      }
    }

    return zones
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
}