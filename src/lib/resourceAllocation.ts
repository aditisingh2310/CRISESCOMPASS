// Resource allocation and recommendation system
export const resourceAllocation = {
  // Find closest resources to an incident
  findClosestResources(incident: any, resources: any[], maxDistance: number = 10): any[] {
    return resources
      .map(resource => ({
        ...resource,
        distance: this.calculateDistance(
          incident.latitude, incident.longitude,
          resource.lat, resource.lng
        )
      }))
      .filter(resource => resource.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3) // Top 3 closest
  },

  // Get recommended response for incident type
  getRecommendedResponse(incident: any, closestResources: any[]): {
    primaryResource: any | null
    responseType: string
    estimatedTime: string
    instructions: string[]
  } {
    const recommendations = {
      fire: {
        responseType: 'Fire Department Response',
        instructions: [
          'Evacuate the area immediately',
          'Do not attempt to fight the fire',
          'Call fire department if not already done',
          'Move to safe distance and wait for professionals'
        ]
      },
      flood: {
        responseType: 'Emergency Services & Rescue',
        instructions: [
          'Move to higher ground immediately',
          'Avoid walking or driving through flood waters',
          'Do not use electrical appliances',
          'Wait for official evacuation instructions'
        ]
      },
      medical: {
        responseType: 'Medical Emergency Response',
        instructions: [
          'Stay with the person if safe to do so',
          'Perform CPR if trained and necessary',
          'Keep person warm and comfortable',
          'Provide clear directions to emergency services'
        ]
      },
      sos: {
        responseType: 'Immediate Emergency Response',
        instructions: [
          'Stay on the line with emergency services',
          'Provide exact location and situation details',
          'Follow dispatcher instructions precisely',
          'Signal your location if possible'
        ]
      },
      shelter: {
        responseType: 'Shelter Coordination',
        instructions: [
          'Proceed to nearest emergency shelter',
          'Bring essential medications and documents',
          'Follow shelter staff instructions',
          'Register upon arrival for coordination'
        ]
      },
      infrastructure: {
        responseType: 'Utility Services Response',
        instructions: [
          'Avoid the affected area if dangerous',
          'Report to utility company if safe',
          'Document damage with photos if possible',
          'Follow local authority guidance'
        ]
      }
    }

    const recommendation = recommendations[incident.type] || {
      responseType: 'General Emergency Response',
      instructions: [
        'Ensure personal safety first',
        'Contact local emergency services',
        'Provide detailed location information',
        'Follow official instructions'
      ]
    }

    // Find best resource based on incident type
    let primaryResource = null
    if (incident.type === 'medical' && closestResources.find(r => r.type === 'hospital')) {
      primaryResource = closestResources.find(r => r.type === 'hospital')
    } else if (incident.type === 'shelter' && closestResources.find(r => r.type === 'shelter')) {
      primaryResource = closestResources.find(r => r.type === 'shelter')
    } else if (closestResources.find(r => r.type === 'police')) {
      primaryResource = closestResources.find(r => r.type === 'police')
    } else {
      primaryResource = closestResources[0] || null
    }

    const estimatedTime = primaryResource
      ? `${Math.round(primaryResource.distance * 3)} minutes`
      : 'Unknown'

    return {
      primaryResource,
      responseType: recommendation.responseType,
      estimatedTime,
      instructions: recommendation.instructions
    }
  },

  // Calculate distance between two points
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