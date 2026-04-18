import React, { useState, useEffect } from 'react'
import { alertBroadcast, Alert } from '../lib/alertBroadcast'

interface AlertPanelProps {
  className?: string
  userLocation?: { latitude: number; longitude: number }
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  className = '',
  userLocation
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showAcknowledged, setShowAcknowledged] = useState(false)

  useEffect(() => {
    // Load existing alerts
    setAlerts(alertBroadcast.getActiveAlerts())

    // Subscribe to new alerts
    const unsubscribe = alertBroadcast.subscribe((newAlert) => {
      setAlerts(prev => [newAlert, ...prev])
    })

    return unsubscribe
  }, [])

  const acknowledgeAlert = (alertId: string) => {
    alertBroadcast.acknowledgeAlert(alertId)
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      default: return 'border-yellow-500 bg-yellow-50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical_incident': return '🚨'
      case 'mass_casualty': return '🚑'
      case 'infrastructure_failure': return '⚠️'
      default: return '📢'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const displayedAlerts = showAcknowledged
    ? alerts
    : alerts.filter(alert => !alert.acknowledged)

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🚨</span>
            Emergency Alerts
          </h3>
          <div className="flex items-center space-x-2">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showAcknowledged}
                onChange={(e) => setShowAcknowledged(e.target.checked)}
                className="mr-1"
              />
              Show acknowledged
            </label>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {displayedAlerts.filter(a => !a.acknowledged).length} active alert{displayedAlerts.filter(a => !a.acknowledged).length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {displayedAlerts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {showAcknowledged ? 'No alerts' : 'No active alerts'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 ${getSeverityColor(alert.severity)} ${
                  alert.acknowledged ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">{getTypeIcon(alert.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {alert.title}
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">{alert.message}</p>

                      <div className="text-xs text-gray-600 space-y-1">
                        <div>
                          📍 {alert.location.description ||
                              `${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}`}
                        </div>
                        {alert.broadcastRadius && (
                          <div>📡 Broadcast radius: {alert.broadcastRadius}km</div>
                        )}
                        <div>🕒 {formatTime(alert.timestamp)}</div>
                      </div>
                    </div>
                  </div>

                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>

                {alert.acknowledged && (
                  <div className="text-xs text-green-600 mt-2">
                    ✓ Acknowledged
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}