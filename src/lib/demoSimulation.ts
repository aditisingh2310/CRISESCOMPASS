// Demo simulation utilities for hackathon presentations
// Generates realistic disaster scenarios for showcasing platform capabilities
export const demoSimulation = {
  // Generate a realistic disaster scenario
  generateScenario(userLocation: {lat: number, lng: number}) {
    const scenarios = [
      {
        type: 'fire',
        descriptions: [
          'Building fire reported - smoke visible from windows',
          'Electrical fire in residential area',
          'Vehicle fire on highway causing traffic disruption',
          'Forest fire approaching residential zone'
        ]
      },
      {
        type: 'flood',
        descriptions: [
          'Flash flooding in low-lying areas',
          'River overflowing, streets becoming impassable',
          'Heavy rainfall causing water accumulation',
          'Storm drain backup flooding basement'
        ]
      },
      {
        type: 'medical',
        descriptions: [
          'Person collapsed on sidewalk, needs immediate medical attention',
          'Car accident with injuries reported',
          'Elderly person experiencing chest pain',
          'Child injured in playground accident'
        ]
      },
      {
        type: 'sos',
        descriptions: [
          'URGENT: Person trapped in collapsed structure',
          'EMERGENCY: Active shooter situation reported',
          'CRISIS: Multiple casualties from explosion',
          'DISTRESS: Person lost in wilderness, low on supplies'
        ]
      }
    ]

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]
    const description = scenario.descriptions[Math.floor(Math.random() * scenario.descriptions.length)]

    // Generate location within 2km radius of user
    const radius = Math.random() * 0.02 // ~2km
    const angle = Math.random() * 2 * Math.PI
    const lat = userLocation.lat + radius * Math.cos(angle)
    const lng = userLocation.lng + radius * Math.sin(angle)

    return {
      type: scenario.type,
      description,
      latitude: lat,
      longitude: lng,
      priority: scenario.type === 'sos' ? 'high' : 'normal',
      created_at: new Date().toISOString()
    }
  },

  // Start continuous demo mode - generates incidents every 10-30 seconds
  startDemoMode(userLocation: {lat: number, lng: number}, onNewIncident: (incident: any) => void) {
    const generateIncident = () => {
      const incident = this.generateScenario(userLocation)
      onNewIncident(incident)

      // Schedule next incident
      const delay = 10000 + Math.random() * 20000 // 10-30 seconds
      setTimeout(generateIncident, delay)
    }

    // Start immediately
    generateIncident()

    // Return stop function
    return () => {
      // In a real implementation, you'd clear the timeout
      console.log('Demo mode stopped')
    }
  }
}