import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo from '@/assets/logo.png'

export const Landing = () => {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-purple-700/30 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg  flex items-center justify-center">
            <img src={logo} alt="logo" className="w-8 h-8" />
          </div>
          <span className="text-white font-bold text-xl">ResAlign AI</span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <Link
              to="/dashboard"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Align Your Skills With
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {' '}Your Dream Job
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            AI-powered resume analysis that matches your skills to job descriptions. 
            Get actionable insights, identify gaps, and land your next opportunity.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              {user ? "Go to Dashboard" : "Start Analyzing Now"}
            </Link>
            <a
              href="#features"
              className="px-8 py-3 border-2 border-purple-500 text-purple-300 rounded-lg font-semibold hover:bg-purple-500/10 transition-all"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white/5 backdrop-blur-sm border-t border-purple-700/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4">
                <span className="text-white text-2xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Upload & Parse</h3>
              <p className="text-gray-400">
                Upload your resume and job descriptions. Our AI instantly extracts 
                skills, experience, and qualifications.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Matching</h3>
              <p className="text-gray-400">
                Get a detailed fit score comparing your profile against job requirements. 
                See exactly how well you match.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-400 to-red-600 flex items-center justify-center mb-4">
                <span className="text-white text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Actionable Tips</h3>
              <p className="text-gray-400">
                Receive personalized recommendations and learning resources to close 
                skill gaps and boost your chances.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              10,000+
            </p>
            <p className="text-gray-400 mt-2">Users Helped</p>
          </div>
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              85%
            </p>
            <p className="text-gray-400 mt-2">Average Match Rate</p>
          </div>
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              500K+
            </p>
            <p className="text-gray-400 mt-2">Jobs Analyzed</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 border-t border-purple-700/30">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Start your free analysis today. No credit card required.
          </p>
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-700/30 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="text-white font-semibold mb-4">Product</p>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-4">Company</p>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-4">Legal</p>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-4">Follow Us</p>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-700/30 pt-8 text-center text-gray-500">
            <p>&copy; 2025 ResAlign AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
