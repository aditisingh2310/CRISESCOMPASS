// Service for handling incident reports with Supabase
import { supabase } from '../lib/supabase'
import { alertBroadcast } from './alertBroadcast'

export interface Incident {
  id?: string
  type: string
  description: string
  latitude: number
  longitude: number
  created_at?: string
  priority?: 'normal' | 'high'
  status?: 'active' | 'resolved' | 'responding'
  severity?: 'low' | 'medium' | 'critical'
  claimed_by?: string
  resolved_at?: string
}

const QUEUED_INCIDENTS_KEY = 'queuedIncidents'

export const incidentService = {
  // Submit a new incident report
  async submitIncident(incident: Omit<Incident, 'id' | 'created_at'>): Promise<Incident | null> {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert([incident])
        .select()
        .single()

      if (error) throw error

      // Check if this incident should trigger an alert
      if (data && alertBroadcast.shouldTriggerAlert(data)) {
        alertBroadcast.createAlert(data)
      }

      return data
    } catch (error) {
      console.error('Error submitting incident:', error)
      // Queue for later if offline
      this.queueIncident(incident)
      return null
    }
  },

  // Fetch all incidents
  async getIncidents(): Promise<Incident[]> {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching incidents:', error)
      return []
    }
  },

  // Queue incident for offline submission
  queueIncident(incident: Omit<Incident, 'id' | 'created_at'>) {
    const queued = this.getQueuedIncidents()
    queued.push({ ...incident, queuedAt: Date.now() })
    localStorage.setItem(QUEUED_INCIDENTS_KEY, JSON.stringify(queued))

    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('sync-incidents')
      })
    }
  },

  // Subscribe to realtime incident updates
  subscribeToIncidents(callback: (incident: Incident) => void) {
    return supabase
      .channel('incidents')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'incidents'
      }, (payload) => {
        const newIncident = payload.new as Incident

        // Check if this incident should trigger an alert
        if (alertBroadcast.shouldTriggerAlert(newIncident)) {
          alertBroadcast.createAlert(newIncident)
        }

        callback(newIncident)
      })
      .subscribe()
  },

  // Update incident status
  async updateIncidentStatus(id: string, status: 'active' | 'resolved' | 'responding', claimedBy?: string): Promise<boolean> {
    try {
      const updateData: any = { status }
      if (claimedBy) updateData.claimed_by = claimedBy
      if (status === 'resolved') updateData.resolved_at = new Date().toISOString()

      const { error } = await supabase
        .from('incidents')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating incident status:', error)
      return false
    }
  },

  // Get incidents within time range
  async getIncidentsInTimeRange(hours: number): Promise<Incident[]> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching incidents in time range:', error)
      return []
    }
  },

  // Get incident statistics
  async getIncidentStats(): Promise<{
    total: number
    byType: Record<string, number>
    byStatus: Record<string, number>
    bySeverity: Record<string, number>
    recentCount: number
  }> {
    try {
      const [allIncidents, recentIncidents] = await Promise.all([
        this.getIncidents(),
        this.getIncidentsInTimeRange(24) // Last 24 hours
      ])

      const byType = allIncidents.reduce((acc, inc) => {
        acc[inc.type] = (acc[inc.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const byStatus = allIncidents.reduce((acc, inc) => {
        acc[inc.status || 'active'] = (acc[inc.status || 'active'] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const bySeverity = allIncidents.reduce((acc, inc) => {
        acc[inc.severity || 'medium'] = (acc[inc.severity || 'medium'] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        total: allIncidents.length,
        byType,
        byStatus,
        bySeverity,
        recentCount: recentIncidents.length
      }
    } catch (error) {
      console.error('Error getting incident stats:', error)
      return { total: 0, byType: {}, byStatus: {}, bySeverity: {}, recentCount: 0 }
    }
  }

  // Get pending queued incidents count
  getQueuedIncidentsCount(): number {
    return this.getQueuedIncidents().length
  },

  // Sync queued incidents when online
  async syncQueuedIncidents(): Promise<void> {
    const queued = this.getQueuedIncidents()
    if (queued.length === 0) return

    const successful: number[] = []

    for (let i = 0; i < queued.length; i++) {
      const { queuedAt, ...incident } = queued[i]
      const result = await this.submitIncident(incident)
      if (result) {
        successful.push(i)
      }
    }

    // Remove successfully submitted incidents
    const remaining = queued.filter((_, index) => !successful.includes(index))
    localStorage.setItem(QUEUED_INCIDENTS_KEY, JSON.stringify(remaining))
  }
}