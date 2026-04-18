// Utility functions for incident processing and analysis
// Handles categorization, clustering, distance calculations, and crisis summaries
export const incidentUtils = {
  // Intelligent incident type detection based on keywords
  categorizeIncident(description: string): string {
    const lowerDesc = description.toLowerCase()

    // Fire-related keywords
    const fireKeywords = ['fire', 'burn', 'smoke', 'flame', 'arson', 'explosion', 'blast']
    if (fireKeywords.some(keyword => lowerDesc.includes(keyword))) {
      return 'fire'
    }

    // Flood-related keywords
    const floodKeywords = ['flood', 'water', 'rain', 'storm', 'overflow', 'drown', 'submerge']
    if (floodKeywords.some(keyword => lowerDesc.includes(keyword))) {
      return 'flood'
    }

    // Medical-related keywords
    const medicalKeywords = ['medical', 'injury', 'hurt', 'pain', 'sick', 'ill', 'emergency', 'ambulance', 'doctor', 'hospital']
    if (medicalKeywords.some(keyword => lowerDesc.includes(keyword))) {
      return 'medical'
    }

    // Shelter-related keywords
    const shelterKeywords = ['shelter', 'homeless', 'evacuate', 'displaced', 'refugee', 'safe place']
    if (shelterKeywords.some(keyword => lowerDesc.includes(keyword))) {
      return 'shelter'
    }

    // Infrastructure-related keywords
    const infraKeywords = ['power', 'electricity', 'gas', 'water', 'road', 'bridge', 'building', 'collapse']
    if (infraKeywords.some(keyword => lowerDesc.includes(keyword))) {
      return 'infrastructure'
    }

    // SOS keywords
    const sosKeywords = ['help', 'emergency', 'urgent', 'danger', 'trapped', 'stuck']
    if (sosKeywords.some(keyword => lowerDesc.includes(keyword))) {
      return 'sos'
    }

    return 'other'
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
  },

  // Group incidents into clusters based on proximity
  clusterIncidents(incidents: any[], maxDistance: number = 0.5): any[] {
    const clusters: any[] = []
    const used = new Set()

    incidents.forEach((incident, index) => {
      if (used.has(index)) return

      const cluster = [incident]
      used.add(index)

      incidents.forEach((other, otherIndex) => {
        if (used.has(otherIndex) || otherIndex === index) return

        const distance = this.calculateDistance(
          incident.latitude, incident.longitude,
          other.latitude, other.longitude
        )

        if (distance <= maxDistance) {
          cluster.push(other)
          used.add(otherIndex)
        }
      })

      clusters.push(cluster.length === 1 ? cluster[0] : {
        isCluster: true,
        count: cluster.length,
        latitude: cluster.reduce((sum, inc) => sum + inc.latitude, 0) / cluster.length,
        longitude: cluster.reduce((sum, inc) => sum + inc.longitude, 0) / cluster.length,
        incidents: cluster
      })
    })

    return clusters
  },

  // Get crisis summary statistics
  getCrisisSummary(incidents: any[]) {
    const total = incidents.length
    const byType = incidents.reduce((acc, inc) => {
      acc[inc.type] = (acc[inc.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const latest = incidents.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]

    // Find most affected area (simple centroid of all incidents)
    const avgLat = incidents.reduce((sum, inc) => sum + inc.latitude, 0) / total
    const avgLng = incidents.reduce((sum, inc) => sum + inc.longitude, 0) / total

    return {
      total,
      byType,
      latest,
      mostAffectedArea: total > 0 ? { lat: avgLat, lng: avgLng } : null
    }
  }
}