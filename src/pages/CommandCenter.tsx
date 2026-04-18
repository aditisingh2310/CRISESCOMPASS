import React, { useState, useEffect } from 'react'
import { IncidentSummarizer } from '../components/IncidentSummarizer'
import { TimelineView } from '../components/TimelineView'
import { AlertPanel } from '../components/AlertPanel'
import { DataVisualization } from '../components/DataVisualization'
import { getIncidents, getIncidentStats } from '../lib/incidentService'

export default function CommandCenter() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null)

  useEffect(() => {
    // Get user location for distance calculations
    navigator.geolocation.getCurrentPosition(pos => {
      setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
    })

    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const statsData = await getIncidentStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crisis Command Center</h1>
              <p className="text-gray-600 mt-1">Real-time crisis coordination and response management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">System Status</div>
                <div className="text-lg font-semibold text-green-600">ACTIVE</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">T</span>
                </div>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Incidents</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : stats?.total || 0}
                </dd>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 truncate">Active Incidents</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : stats?.byStatus?.active || 0}
                </dd>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">C</span>
                </div>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 truncate">Critical Incidents</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : stats?.bySeverity?.critical || 0}
                </dd>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">R</span>
                </div>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 truncate">Resolved (24h)</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : (stats?.byStatus?.resolved || 0)}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Intelligence & Alerts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Crisis Intelligence */}
            <IncidentSummarizer />

            {/* Emergency Alerts */}
            <AlertPanel userLocation={userLocation || undefined} />

            {/* Incident Timeline */}
            <TimelineView />

            {/* Data Visualization */}
            <DataVisualization />
          </div>

          {/* Right Column - Quick Actions & Resources */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  🚨 Emergency Broadcast
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  📞 Contact Authorities
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  🚑 Deploy Resources
                </button>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  📊 Generate Report
                </button>
              </div>
            </div>

            {/* Resource Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fire Teams</span>
                  <span className="text-sm font-medium text-green-600">8/10 Available</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Medical Units</span>
                  <span className="text-sm font-medium text-yellow-600">5/8 Available</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{width: '62.5%'}}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Police Units</span>
                  <span className="text-sm font-medium text-red-600">2/6 Available</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{width: '33%'}}></div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Fire incident resolved at Downtown Ave</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Medical unit dispatched to River St</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Critical alert: Building fire reported</p>
                    <p className="text-xs text-gray-500">8 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}