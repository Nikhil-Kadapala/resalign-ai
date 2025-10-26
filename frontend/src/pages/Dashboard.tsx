import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'

export const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <DashboardLayout>
      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user?.user_metadata.full_name}! 👋
          </h1>
          <p className="text-gray-600">
            Analyze your resume and get matched with job opportunities
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12 px-32">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">Total Analyses</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm font-medium">Best Match Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-pink-500">
            <p className="text-gray-600 text-sm font-medium">Skills Analyzed</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Recommendations</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>

        {/* Main CTA */}
        <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 
            rounded-lg py-12 ml-20 text-white text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Analyze Your Resume?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Upload your resume and job description to get detailed insights and recommendations
          </p>
          <button 
            onClick={() => navigate('/analysis/new')}
            className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-all">
            Start New Analysis
          </button>
        </div>

      </div>
    </DashboardLayout>
  )
}
