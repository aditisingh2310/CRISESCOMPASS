// Alert broadcast system for critical incidents
export interface Alert {
  id: string
  incidentId: string
  type: 'critical_incident' | 'mass_casualty' | 'infrastructure_failure'
  title: string
  message: string
  severity: 'critical' | 'high' | 'medium'
  location: {
    latitude: number
    longitude: number
    description?: string
  }
  timestamp: Date
  acknowledged: boolean
  broadcastRadius?: number // in km
}

class AlertBroadcastSystem {
  private alerts: Alert[] = []
  private listeners: ((alert: Alert) => void)[] = []

  // Check if an incident should trigger an alert
  shouldTriggerAlert(incident: any): boolean {
    return (
      incident.severity === 'critical' ||
      incident.type === 'sos' ||
      (incident.type === 'fire' && incident.description?.toLowerCase().includes('building')) ||
      (incident.type === 'flood' && incident.description?.toLowerCase().includes('evacuation'))
    )
  }

  // Create alert from incident
  createAlert(incident: any): Alert {
    const alertType = this.determineAlertType(incident)
    const title = this.generateAlertTitle(incident, alertType)
    const message = this.generateAlertMessage(incident, alertType)

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      incidentId: incident.id,
      type: alertType,
      title,
      message,
      severity: incident.severity || 'high',
      location: {
        latitude: incident.latitude,
        longitude: incident.longitude,
        description: incident.location_description
      },
      timestamp: new Date(),
      acknowledged: false,
      broadcastRadius: this.calculateBroadcastRadius(incident)
    }

    this.alerts.unshift(alert) // Add to beginning for chronological order
    this.notifyListeners(alert)

    return alert
  }

  private determineAlertType(incident: any): Alert['type'] {
    if (incident.type === 'sos') return 'critical_incident'
    if (incident.severity === 'critical') return 'critical_incident'
    if (incident.description?.toLowerCase().includes('multiple') ||
        incident.description?.toLowerCase().includes('mass')) {
      return 'mass_casualty'
    }
    if (incident.type === 'fire' || incident.type === 'flood') {
      return 'infrastructure_failure'
    }
    return 'critical_incident'
  }

  private generateAlertTitle(incident: any, type: Alert['type']): string {
    const typeLabels = {
      critical_incident: 'CRITICAL INCIDENT',
      mass_casualty: 'MASS CASUALTY EVENT',
      infrastructure_failure: 'INFRASTRUCTURE FAILURE'
    }

    return `${typeLabels[type]} - ${incident.type.toUpperCase()}`
  }

  private generateAlertMessage(incident: any, type: Alert['type']): string {
    const baseMessage = `${incident.description || 'Emergency situation reported'}`

    switch (type) {
      case 'critical_incident':
        return `URGENT: ${baseMessage}. Immediate response required. Location: ${incident.location_description || 'coordinates provided'}.`
      case 'mass_casualty':
        return `MULTIPLE CASUALTIES: ${baseMessage}. Activate emergency protocols. Coordinate with medical services.`
      case 'infrastructure_failure':
        return `INFRASTRUCTURE THREAT: ${baseMessage}. Potential for widespread impact. Evacuation may be necessary.`
      default:
        return baseMessage
    }
  }

  private calculateBroadcastRadius(incident: any): number {
    // Base radius on severity and type
    let radius = 5 // 5km default

    if (incident.severity === 'critical') radius = 10
    if (incident.type === 'fire') radius = 8
    if (incident.type === 'flood') radius = 15
    if (incident.type === 'sos') radius = 3

    return radius
  }

  // Subscribe to new alerts
  subscribe(callback: (alert: Alert) => void): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  private notifyListeners(alert: Alert) {
    this.listeners.forEach(callback => callback(alert))
  }

  // Get all active alerts
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.acknowledged)
  }

  // Acknowledge an alert
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      return true
    }
    return false
  }

  // Get alerts within radius of a location
  getAlertsInRadius(latitude: number, longitude: number, radiusKm: number): Alert[] {
    return this.alerts.filter(alert => {
      const distance = this.calculateDistance(
        latitude, longitude,
        alert.location.latitude, alert.location.longitude
      )
      return distance <= radiusKm
    })
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

// Singleton instance
export const alertBroadcast = new AlertBroadcastSystem()