import React, { useState, useEffect } from 'react'
import { aiSummarizer } from '../lib/aiSummarizer'
import { getIncidents } from '../lib/incidentService'

interface IncidentSummarizerProps {
  refreshInterval?: number // in milliseconds, default 5 minutes
  className?: string
}

export const IncidentSummarizer: React.FC<IncidentSummarizerProps> = ({
  refreshInterval = 300000, // 5 minutes
  className = ''
}) => {
  const [summary, setSummary] = useState<string>('')
  const [assessment, setAssessment] = useState<{
    level: 'normal' | 'elevated' | 'critical'
    message: string
    recommendations: string[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const updateSummary = async () => {
    try {
      setLoading(true)
      const incidents = await getIncidents()

      const newSummary = aiSummarizer.generateIncidentSummary(incidents)
      const newAssessment = aiSummarizer.getCrisisAssessment(incidents)

      setSummary(newSummary)
      setAssessment(newAssessment)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to generate incident summary:', error)
      setSummary('Unable to generate summary. Check connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    updateSummary()

    const interval = setInterval(updateSummary, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const getAssessmentColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'elevated': return 'text-orange-600 bg-orange-50 border-orange-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  return (
    <div className={`bg-white rounded-lg border p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Crisis Intelligence</h3>
        <div className="text-xs text-gray-500">
          Updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-700 mb-4">{summary}</p>

          {assessment && (
            <div className={`rounded-lg border p-3 mb-4 ${getAssessmentColor(assessment.level)}`}>
              <div className="flex items-center mb-2">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  assessment.level === 'critical' ? 'bg-red-500' :
                  assessment.level === 'elevated' ? 'bg-orange-500' : 'bg-green-500'
                }`}></div>
                <span className="text-sm font-medium capitalize">{assessment.level} Alert</span>
              </div>
              <p className="text-sm mb-2">{assessment.message}</p>
              <div className="text-xs">
                <strong>Recommendations:</strong>
                <ul className="mt-1 space-y-1">
                  {assessment.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <button
            onClick={updateSummary}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
            disabled={loading}
          >
            Refresh Now
          </button>
        </>
      )}
    </div>
  )
}