import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DashboardLayout } from '../components/DashboardLayout'
import { Upload, CheckCircle, Loader, FileText, Zap, Shield, Lightbulb } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useFileValidation } from '@/hooks/useFileValidation'
import { useUrlVerification } from '@/hooks/useUrlVerification'
import { useUploadAPI } from '@/hooks/useUploadAPI'
import { useAnalyzeAPI } from '@/hooks/useAnalyzeAPI'
import { AnalysisProgressModal } from '@/components/AnalysisProgressModal'
import { textToPdfFile } from "@/lib/pdfConverter"
import { timestamp, sanitizeFilename } from '@/lib/utils'

type TabType = 'url' | 'raw'

interface UploadState {
  file: File | null
  progress: number
  isUploading: boolean
  error: string | null
  success: boolean
}

export const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { validateFile, formatFileSize } = useFileValidation()
  const { isLoading: isVerifying, processJobDescriptionUrl } = useUrlVerification()
  const { isLoading: isUploading, uploadResumeAndJD } = useUploadAPI()
  const { progressState, startAnalysis, cancelAnalysis, reset: resetAnalysis, databaseIds } = useAnalyzeAPI()

  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: 0,
    isUploading: false,
    error: null,
    success: false,
  })

  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('url')
  const [jdUrl, setJdUrl] = useState('')
  const [jdRawText, setJdRawText] = useState('')
  const [jdContent, setJdContent] = useState<string | null>(null)
  const [jdError, setJdError] = useState('')
  const [isProcessingUrl, setIsProcessingUrl] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Navigate to results page when analysis completes
  useEffect(() => {
    if (progressState.isComplete && !progressState.hasError && databaseIds.resumeDbId && databaseIds.jdDbId) {
      // Small delay to let modal show completion message
      const timer = setTimeout(() => {
        navigate(`/analysis/${databaseIds.resumeDbId}/${databaseIds.jdDbId}`)
        setShowAnalysisModal(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [progressState.isComplete, progressState.hasError, databaseIds, navigate])

  const handleFileSelect = (file: File) => {
    setUploadState(prev => ({ ...prev, error: null }))

    const validation = validateFile(file)
    if (!validation.isValid) {
      setUploadState(prev => ({
        ...prev,
        error: validation.error,
      }))
      toast.warning(validation.error || 'File validation failed')
      return
    }

    setUploadState(prev => ({
      ...prev,
      file,
      isUploading: true,
      success: false,
      progress: 0,
    }))

    simulateUpload()
    toast.success(`File selected: ${file.name}`)
  }

  const simulateUpload = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadState(prev => ({
          ...prev,
          progress: 100,
          isUploading: false,
          success: true,
        }))
        toast.success('Resume ready for analysis')
      } else {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(progress, 99),
        }))
      }
    }, 500)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemoveFile = () => {
    setUploadState({
      file: null,
      progress: 0,
      isUploading: false,
      error: null,
      success: false,
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.info('Resume removed')
  }

  const handleUrlVerification = async () => {
    if (!jdUrl.trim()) {
      setJdError('Please enter a URL')
      toast.error('Please enter a URL')
      return
    }

    try {
      new URL(jdUrl)
    } catch {
      setJdError('Invalid URL format')
      toast.error('Invalid URL format')
      return
    }

    setIsProcessingUrl(true)
    setJdError('')

    const loadingToastId = toast.loading('Verifying URL safety and fetching content...')

    try {
      const result = await processJobDescriptionUrl(jdUrl)

      if (!result.success) {
        const errorMsg = result.error || 'Failed to process URL'
        toast.dismiss(loadingToastId)
        setJdError(errorMsg)
        toast.error(errorMsg)
        return
      }

      if (!result.content) {
        const errorMsg = 'No content could be extracted from URL'
        toast.dismiss(loadingToastId)
        setJdError(errorMsg)
        toast.error(errorMsg)
        return
      }

      toast.dismiss(loadingToastId)
      setJdContent(result.content)
      setJdError('')
      toast.success('URL verified and content fetched successfully')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to process URL'
      toast.dismiss(loadingToastId)
      setJdError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsProcessingUrl(false)
    }
  }

  const validateJDInput = (): boolean => {
    setJdError('')

    if (activeTab === 'url') {
      if (!jdUrl.trim()) {
        const msg = 'Please enter a URL'
        setJdError(msg)
        toast.error(msg)
        return false
      }

      if (!jdContent) {
        const msg = 'Please verify and fetch the job description from URL first'
        setJdError(msg)
        toast.error(msg)
        return false
      }
    } else {
      if (!jdRawText.trim()) {
        const msg = 'Please enter job description text'
        setJdError(msg)
        toast.error(msg)
        return false
      }

      if (jdRawText.trim().length < 50) {
        const msg = 'Job description should be at least 50 characters'
        setJdError(msg)
        toast.error(msg)
        return false
      }
    }

    return true
  }

  const handleAnalyze = async () => {
    if (!uploadState.file || !uploadState.success) {
      const msg = 'Please upload a resume first'
      setUploadState(prev => ({ ...prev, error: msg }))
      toast.error(msg)
      return
    }

    if (!validateJDInput()) {
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in first')
        navigate('/login')
        return
      }

      const toastId = toast.loading('Converting job description to PDF and uploading...')

      const finalJdText = activeTab === 'url' ? jdContent! : jdRawText

      const analysisTimestamp = timestamp()

      let jdPdfFile: File
      try {
        const jdFilename = `jd_${analysisTimestamp}.pdf`
        jdPdfFile = await textToPdfFile(finalJdText, jdFilename)
      } catch (error) {
        toast.dismiss(toastId)
        const errorMsg = error instanceof Error ? error.message : 'Failed to convert job description to PDF'
        toast.error(errorMsg)
        return
      }

      const resumeBaseFile = uploadState.file as File
      const sanitizedResumeName = sanitizeFilename(resumeBaseFile.name)
      const versionedResumeFile = new File(
        [resumeBaseFile],
        `${sanitizedResumeName}_${analysisTimestamp}.pdf`,
        { type: 'application/pdf' }
      )

      const result = await uploadResumeAndJD(
        versionedResumeFile,
        jdPdfFile
      )

      toast.dismiss(toastId)

      if (!result) {
        toast.error('Upload failed. Please try again.')
        return
      }

      toast.success('Upload successful! Starting analysis...')

      setShowAnalysisModal(true)
      resetAnalysis()

      // Start analysis (will extract data and get database IDs, then run analysis)
      await startAnalysis(result)
    } catch (error) {
      console.error('Analysis failed:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to start analysis'
      toast.error(errorMsg)
    }
  }

  const handleResetForm = () => {
    setUploadState({
      file: null,
      progress: 0,
      isUploading: false,
      error: null,
      success: false,
    })
    setJdUrl('')
    setJdRawText('')
    setJdContent(null)
    setJdError('')
    setActiveTab('url')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.info('Form reset')
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 via-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome, {user?.user_metadata.full_name}! 👋
            </h1>
            <p className="text-gray-300">
              Analyze your resume and get matched with job opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2">
              {/* Resume Upload Section */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Step 1: Upload Your Resume</h2>

                {!uploadState.success ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-purple-500/30 rounded-lg p-12 text-center bg-slate-800/40 hover:bg-slate-800/60 hover:border-purple-500/50 transition-colors cursor-pointer backdrop-blur-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-white mb-2">Drag and drop your resume</p>
                    <p className="text-sm text-gray-400 mb-4">or click to browse</p>
                    <p className="text-xs text-gray-500">PDF only (Max 5MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileInputChange}
                      accept=".pdf"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-white">{uploadState.file?.name}</p>
                        <p className="text-sm text-gray-300">
                          {formatFileSize(uploadState.file?.size || 0)}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="text-sm text-red-400 hover:text-red-300 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploadState.isUploading && (
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Loader className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-sm font-medium text-gray-300">Uploading...</span>
                      <span className="text-sm text-gray-400 ml-auto">{Math.round(uploadState.progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadState.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Job Description Section */}
              {uploadState.success && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-white mb-6">Step 2: Provide Job Description</h2>

                  {/* Tabs */}
                  <div className="flex gap-2 mb-6 border-b border-purple-500/30">
                    <button
                      onClick={() => {
                        setActiveTab('url')
                        setJdContent(null)
                        setJdError('')
                      }}
                      className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === 'url'
                          ? 'border-purple-500 text-purple-300'
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      From URL
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('raw')
                        setJdError('')
                      }}
                      className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === 'raw'
                          ? 'border-purple-500 text-purple-300'
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      Raw Text
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="bg-slate-800/40 rounded-lg border border-purple-500/30 p-6 backdrop-blur-sm">
                    {activeTab === 'url' ? (
                      <div>
                        <label htmlFor="jd-url" className="block text-sm font-medium text-white mb-2">
                          Job Description URL
                        </label>
                        <div className="flex gap-2 mb-4">
                          <input
                            id="jd-url"
                            type="url"
                            value={jdUrl}
                            onChange={(e) => {
                              setJdUrl(e.target.value)
                              setJdError('')
                            }}
                            placeholder="https://example.com/job-posting"
                            className="flex-1 px-4 py-3 border border-purple-500/30 bg-slate-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={isProcessingUrl || isVerifying}
                          />
                          <button
                            onClick={handleUrlVerification}
                            disabled={!jdUrl.trim() || isProcessingUrl || isVerifying}
                            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                          >
                            {isProcessingUrl || isVerifying ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              'Fetch'
                            )}
                          </button>
                        </div>

                        {jdContent && (
                          <div className="mb-4 p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-300">URL verified and content fetched</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Extracted {jdContent.length} characters
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                          We'll verify the URL is safe and extract the job description text
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="jd-text" className="block text-sm font-medium text-white mb-2">
                          Job Description Text
                        </label>
                        <textarea
                          id="jd-text"
                          value={jdRawText}
                          onChange={(e) => {
                            setJdRawText(e.target.value)
                            setJdError('')
                          }}
                          placeholder="Paste the job description here..."
                          rows={8}
                          className="w-full px-4 py-3 border border-purple-500/30 bg-slate-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          {jdRawText.length} characters (minimum 50 required)
                        </p>
                      </div>
                    )}

                    {/* Error Message */}
                    {jdError && (
                      <div className="mt-4 flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <span className="text-red-400 flex-shrink-0">⚠️</span>
                        <p className="text-sm text-red-300">{jdError}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {uploadState.success && (
                <div className="flex gap-4">
                  <button
                    onClick={handleResetForm}
                    className="px-6 py-3 border border-purple-500/30 rounded-lg font-medium text-gray-300 hover:bg-purple-500/10 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={isUploading || isProcessingUrl}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Resume'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar - Right Side */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* File Requirements Card */}
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30 p-6 shadow-lg backdrop-blur-sm">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    File Requirements
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">✓</span>
                      <span><strong>Format:</strong> PDF only</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">✓</span>
                      <span><strong>Max Size:</strong> 5MB</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">✓</span>
                      <span><strong>Min Content:</strong> JD 50+ chars</span>
                    </li>
                  </ul>
                </div>

                {/* What You'll Get Card */}
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 shadow-lg p-6 backdrop-blur-sm">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    What You'll Get
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">→</span>
                      <span>Skill match analysis and Job Fit score</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">→</span>
                      <span>Missing Skills</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">→</span>
                      <span>Improvement suggestions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">→</span>
                      <span>Learning resources</span>
                    </li>
                  </ul>
                </div>

                {/* Tips Card */}
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30 shadow-lg p-6 backdrop-blur-sm">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Pro Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Use complete job descriptions for better accuracy</li>
                    <li>• Include all relevant work experience</li>
                    <li>• Highlight key technical skills</li>
                    <li>• Keep resume format clean and clear</li>
                  </ul>
                </div>

                {/* Privacy Card */}
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30 p-6 shadow-lg backdrop-blur-sm">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Your Privacy
                  </h3>
                  <p className="text-xs text-gray-300">
                    Your resumes are processed securely and never shared with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnalysisProgressModal
        isOpen={showAnalysisModal}
        progressState={progressState}
        onCancel={() => {
          setShowAnalysisModal(false)
          cancelAnalysis()
        }}
      />
    </DashboardLayout>
  )
}
