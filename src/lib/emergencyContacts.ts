// Emergency contact numbers for different regions
// Provides location-aware emergency services contact information
export const emergencyContacts = {
  // Default international emergency numbers
  default: {
    ambulance: '112',
    police: '112',
    fire: '112'
  },

  // US emergency numbers
  us: {
    ambulance: '911',
    police: '911',
    fire: '911'
  },

  // India emergency numbers
  india: {
    ambulance: '108',
    police: '100',
    fire: '101'
  },

  // UK emergency numbers
  uk: {
    ambulance: '999',
    police: '999',
    fire: '999'
  },

  // Australia emergency numbers
  australia: {
    ambulance: '000',
    police: '000',
    fire: '000'
  }
}

// Get emergency contacts based on user location
export const getEmergencyContacts = (lat?: number, lng?: number) => {
  // Simple region detection based on coordinates
  // In a real app, you'd use a geocoding service
  if (lat && lng) {
    // Rough US detection (west coast to east coast)
    if (lat >= 24 && lat <= 49 && lng >= -125 && lng <= -67) {
      return emergencyContacts.us
    }
    // Rough India detection
    if (lat >= 8 && lat <= 37 && lng >= 68 && lng <= 97) {
      return emergencyContacts.india
    }
    // Rough UK detection
    if (lat >= 49 && lat <= 59 && lng >= -8 && lng <= 2) {
      return emergencyContacts.uk
    }
    // Rough Australia detection
    if (lat >= -44 && lat <= -10 && lng >= 113 && lng <= 154) {
      return emergencyContacts.australia
    }
  }

  return emergencyContacts.default
}