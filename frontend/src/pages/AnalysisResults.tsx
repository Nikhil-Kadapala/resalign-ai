import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { Loader, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export const AnalysisResults = () => {
  const { resumeId, jdId } = useParams()
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!resumeId || !jdId) return

    const startAnalysis = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Connect to SSE endpoint
      const eventSource = new EventSource(
        `http://localhost:8000/api/v1/analyze/${resumeId}/${jdId}?user_id=${user.id}`
      )

      eventSource.addEventListener('progress', (e) => {
        const data = JSON.parse((e as any).data)
        setProgress(data.progress)
        setMessage(data.message)
      })

      eventSource.addEventListener('complete', (e) => {
        const data = JSON.parse((e as any).data)
        setResults(data)
        setProgress(100)
        eventSource.close()
      })

      eventSource.addEventListener('error', (e) => {
        const data = JSON.parse((e as any).data)
        setError(data.error)
        eventSource.close()
      })

      eventSource.onerror = () => {
        setError('Connection error')
        eventSource.close()
      }
    }

    startAnalysis()
  }, [resumeId, jdId])

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Analysis Results</h1>

        {/* Progress */}
        {!results && !error && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Loader className="animate-spin" />
              <span className="font-medium">{message}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Overall Match Score</h2>
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {results.overall_score}%
              </div>
              <div className="text-lg capitalize">{results.fit_classification} Fit</div>
            </div>

            {/* Category Scores */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Category Breakdown</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Technical Skills</span>
                    <span className="font-medium">{results.technical_skills_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${results.technical_skills_score}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Experience</span>
                    <span className="font-medium">{results.experience_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${results.experience_score}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Education</span>
                    <span className="font-medium">{results.education_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${results.education_score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Missing Skills */}
            {results.missing_skills && results.missing_skills.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Missing Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {results.missing_skills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Recommendations</h2>
                <div className="space-y-3">
                  {results.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      <AlertCircle className="text-yellow-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium capitalize">{rec.category}</div>
                        <div className="text-gray-600">{rec.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex gap-3">
              <AlertCircle className="text-red-500" />
              <div>
                <h3 className="font-bold text-red-900">Analysis Failed</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}