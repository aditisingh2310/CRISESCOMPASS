// Incident severity scoring and analysis
export const severityAnalysis = {
  // Calculate severity score for an incident
  calculateSeverity(incident: any, nearbyIncidents: any[] = []): 'low' | 'medium' | 'critical' {
    let score = 0

    // Keywords indicating high severity
    const criticalKeywords = ['death', 'dying', 'unconscious', 'bleeding heavily', 'trapped', 'collapsed building', 'explosion', 'active shooter']
    const mediumKeywords = ['injury', 'hurt', 'pain', 'fire', 'flood', 'accident', 'emergency']

    const description = incident.description.toLowerCase()

    if (criticalKeywords.some(keyword => description.includes(keyword))) {
      score += 50
    } else if (mediumKeywords.some(keyword => description.includes(keyword))) {
      score += 25
    }

    // Incident type weights
    const typeWeights: Record<string, number> = {
      'sos': 40,
      'medical': 30,
      'fire': 35,
      'flood': 25,
      'infrastructure': 20,
      'shelter': 15
    }
    score += typeWeights[incident.type] || 10

    // Priority boost
    if (incident.priority === 'high') score += 20

    // Nearby incidents boost (indicates cluster/area issue)
    score += Math.min(nearbyIncidents.length * 5, 20)

    // Time-based urgency (recent incidents are more urgent)
    const hoursSince = (Date.now() - new Date(incident.created_at).getTime()) / (1000 * 60 * 60)
    if (hoursSince < 1) score += 15

    if (score >= 70) return 'critical'
    if (score >= 35) return 'medium'
    return 'low'
  },

  // Update incident with calculated severity
  async updateIncidentSeverity(incident: any, nearbyIncidents: any[] = []): Promise<any> {
    const severity = this.calculateSeverity(incident, nearbyIncidents)
    return { ...incident, severity }
  },

  // Get severity color for UI
  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#dc2626' // red-600
      case 'medium': return '#d97706' // amber-600
      case 'low': return '#16a34a' // green-600
      default: return '#6b7280' // gray-500
    }
  },

  // Get severity icon
  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨'
      case 'medium': return '⚠️'
      case 'low': return 'ℹ️'
      default: return '📍'
    }
  }
}