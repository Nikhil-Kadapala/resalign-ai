import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { AnalysisReport } from '../components/AnalysisReport'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { motion } from 'motion/react';
import { Card, CardContent } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import type { AnalysisResult, AnalysisProgressState } from '../types/analysis'

// Progress stage messages - defined outside component to avoid useEffect dependency issues
const stageMessages: Record<string, string> = {
  'starting_analysis': 'Starting analysis...',
  'calculating_match_score': 'Calculating match scores...',
  'assessing_job_fit': 'Assessing job fit...',
  'generating_recommendations': 'Generating personalized recommendations...',
  'curating_learning_resources': 'Curating learning resources...',
  'saving': 'Saving results...',
  'complete': 'Analysis complete!',
  'error': 'Analysis failed',
}

export const AnalysisResults = () => {
  const { resumeId, jdId } = useParams()
  const navigate = useNavigate()
  const [progressState, setProgressState] = useState<AnalysisProgressState>({
    currentStatus: '',
    progress: 0,
    message: '',
    stages: [],
    isComplete: false,
    hasError: false,
  })
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!resumeId || !jdId) {
      navigate('/dashboard')
      return
    }

    const startAnalysis = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('Authentication failed. Please log in again.')
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          setError('Session expired. Please log in again.')
          return
        }

        // Call the analyze endpoint
        const response = await fetch('http://localhost:8000/api/v1/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            resume_db_id: resumeId,
            jd_db_id: jdId,
          }),
        })

        if (!response.ok) {
          throw new Error(`Analysis request failed: ${response.statusText}`)
        }

        // Handle SSE stream
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let isDone = false

        try {
          while (!isDone) {
            const { done, value } = await reader.read()
            if (done) {
              console.log('Stream ended')
              break
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.substring(6).trim()
                console.log('Raw SSE data:', dataStr.substring(0, 100))

                if (dataStr === '[DONE]') {
                  console.log('Received [DONE] signal')
                  isDone = true
                  break
                }

                try {
                  const event = JSON.parse(dataStr)
                  console.log('SSE event received:', event.event, Object.keys(event.data || {}))

                  if (event.event === 'progress') {
                    const stage = event.data.stage
                    const message = stageMessages[stage] || event.data.message
                    console.log(`Progress: ${stage} (${event.data.progress}%)`)
                    
                    setProgressState((prev) => ({
                      ...prev,
                      currentStatus: stage,
                      progress: event.data.progress,
                      message,
                    }))
                  } else if (event.event === 'complete') {
                    console.log('Received complete event with data:', {
                      has_analysis_id: !!event.data?.analysis_id,
                      has_overall_score: !!event.data?.overall_score,
                      has_recommendations: Array.isArray(event.data?.recommendations),
                      has_learning_resources: Array.isArray(event.data?.learning_resources),
                      recommendations_count: event.data?.recommendations?.length || 0,
                      resources_count: event.data?.learning_resources?.length || 0,
                    })
                    
                    // Validate data structure before setting results
                    if (event.data && typeof event.data === 'object' && event.data.analysis_id) {
                      console.log('Setting results state')
                      setResults(event.data as AnalysisResult)
                      setProgressState((prev) => ({
                        ...prev,
                        isComplete: true,
                        progress: 100,
                        message: 'Analysis complete!',
                      }))
                    } else {
                      console.error('Invalid complete event data:', event.data)
                      setError('Received invalid analysis results. Please try again.')
                    }
                  } else if (event.event === 'error') {
                    throw new Error(event.data.error || event.data.message || 'Analysis failed')
                  }
                } catch (parseErr) {
                  if (parseErr instanceof Error && !parseErr.message.includes('JSON')) {
                    console.error('Error parsing SSE data:', parseErr)
                    throw parseErr
                  } else if (parseErr instanceof SyntaxError) {
                    console.error('Invalid JSON in SSE data:', dataStr.substring(0, 200))
                  }
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
          console.log('Reader lock released')
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
        setError(errorMessage)
        setProgressState((prev) => ({
          ...prev,
          hasError: true,
          error: errorMessage,
        }))
      }
    }

    startAnalysis()
  }, [resumeId, jdId, navigate])

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Analysis Results</h1>
            <p className="text-gray-600">Your personalized resume-job fit analysis</p>
          </motion.div>

          {/* Progress Section */}
          {!results && !error && (
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-600" />
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Animated Loader */}
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="relative w-16 h-16"
                      >
                        <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-indigo-600" />
                      </motion.div>
                    </div>

                    {/* Status Message */}
                    <div className="text-center space-y-2">
                      <motion.p
                        className="text-lg font-semibold text-gray-900"
                        key={progressState.message}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {progressState.message}
                      </motion.p>
                      <p className="text-sm text-gray-600">
                        Step: {progressState.currentStatus.replace(/_/g, ' ').charAt(0).toUpperCase() + progressState.currentStatus.replace(/_/g, ' ').slice(1)}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <Progress value={progressState.progress} className="h-3" />
                      <p className="text-xs text-gray-600 text-center font-medium">
                        {progressState.progress}% complete
                      </p>
                    </div>

                    {/* Stage Indicators */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: 'Upload', progress: 30 },
                        { label: 'Score', progress: 60 },
                        { label: 'Analyze', progress: 80 },
                        { label: 'Save', progress: 90 },
                        { label: 'Done', progress: 100 },
                      ].map((stage, idx) => (
                        <motion.div
                          key={idx}
                          className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                            progressState.progress >= stage.progress
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                          animate={progressState.progress >= stage.progress ? { scale: 1.05 } : { scale: 1 }}
                        >
                          {progressState.progress >= stage.progress && (
                            <CheckCircle2 className="inline-block h-3 w-3 mr-1" />
                          )}
                          {stage.label}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Error Section */}
          {error && (
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
                <div className="h-1 bg-gradient-to-r from-red-400 to-pink-600" />
                <CardContent className="p-8">
                  <div className="flex gap-4 items-start">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-900 mb-2">Analysis Failed</h3>
                      <p className="text-red-700 mb-4">{error}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results Section */}
          {results && (
            <motion.div variants={itemVariants}>
              <AnalysisReport results={results} />
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}