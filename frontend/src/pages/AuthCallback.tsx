import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase automatically handles the callback
    // Just redirect to dashboard
    const timer = setTimeout(() => {
      navigate('/dashboard')
    }, 1000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto" />
        <p className="mt-4 text-gray-300 font-medium">Completing sign in...</p>
      </div>
    </div>
  )
}
