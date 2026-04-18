// AI-powered incident summarization
export const aiSummarizer = {
  // Generate incident summary using simple pattern analysis
  generateIncidentSummary(incidents: any[]): string {
    if (incidents.length === 0) {
      return "No recent incidents reported. System operating normally."
    }

    const recentIncidents = incidents.filter(inc => {
      const hoursSince = (Date.now() - new Date(inc.created_at).getTime()) / (1000 * 60 * 60)
      return hoursSince <= 24 // Last 24 hours
    })

    if (recentIncidents.length === 0) {
      return "No incidents in the past 24 hours. Monitoring active."
    }

    // Analyze patterns
    const byType = recentIncidents.reduce((acc, inc) => {
      acc[inc.type] = (acc[inc.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const criticalIncidents = recentIncidents.filter(inc => inc.severity === 'critical').length
    const mostCommonType = Object.entries(byType).sort(([,a], [,b]) => b - a)[0]

    // Find geographic concentration
    const avgLat = recentIncidents.reduce((sum, inc) => sum + inc.latitude, 0) / recentIncidents.length
    const avgLng = recentIncidents.reduce((sum, inc) => sum + inc.longitude, 0) / recentIncidents.length

    // Generate summary
    let summary = `${recentIncidents.length} incident${recentIncidents.length !== 1 ? 's' : ''} reported in the past 24 hours. `

    if (mostCommonType) {
      summary += `Most common: ${mostCommonType[0]} (${mostCommonType[1]} report${mostCommonType[1] !== 1 ? 's' : ''}). `
    }

    if (criticalIncidents > 0) {
      summary += `${criticalIncidents} critical incident${criticalIncidents !== 1 ? 's' : ''} requiring immediate attention. `
    }

    // Add geographic context (simplified)
    if (recentIncidents.length >= 3) {
      summary += `Activity concentrated around coordinates ${avgLat.toFixed(2)}, ${avgLng.toFixed(2)}.`
    }

    return summary
  },

  // Get crisis assessment
  getCrisisAssessment(incidents: any[]): {
    level: 'normal' | 'elevated' | 'critical'
    message: string
    recommendations: string[]
  } {
    const recentIncidents = incidents.filter(inc => {
      const hoursSince = (Date.now() - new Date(inc.created_at).getTime()) / (1000 * 60 * 60)
      return hoursSince <= 6 // Last 6 hours
    })

    const criticalCount = recentIncidents.filter(inc => inc.severity === 'critical').length
    const totalRecent = recentIncidents.length

    let level: 'normal' | 'elevated' | 'critical'
    let message: string
    let recommendations: string[]

    if (totalRecent === 0) {
      level = 'normal'
      message = 'Situation normal. No recent incidents.'
      recommendations = ['Continue standard monitoring', 'Maintain readiness']
    } else if (criticalCount >= 3 || totalRecent >= 10) {
      level = 'critical'
      message = 'Critical situation developing. Multiple incidents requiring immediate response.'
      recommendations = [
        'Activate emergency response protocols',
        'Deploy additional responders',
        'Establish incident command center',
        'Communicate with local authorities'
      ]
    } else if (criticalCount >= 1 || totalRecent >= 5) {
      level = 'elevated'
      message = 'Elevated activity. Monitor closely and prepare for escalation.'
      recommendations = [
        'Increase monitoring frequency',
        'Prepare additional resources',
        'Communicate with response teams',
        'Review emergency plans'
      ]
    } else {
      level = 'normal'
      message = 'Minor incidents reported. Standard response adequate.'
      recommendations = [
        'Monitor situation',
        'Respond to individual incidents',
        'Maintain situational awareness'
      ]
    }

    return { level, message, recommendations }
  }
}