import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo from '@/assets/logo.png'
import { Features } from './Features'
import { FAQ } from './FAQ'
import { WaitlistModal } from '@/components/WaitlistModal'

export const Landing = () => {
  const { user } = useAuth()
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-purple-700/30 backdrop-blur-sm">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="w-fit h-10 rounded-lg  flex items-center justify-center">
            <img src={logo} alt="logo" className="w-8 h-8" />
            <span className="text-white font-bold text-xl">ResAlign AI</span>
          </div>
          <div className="text-center grid md:grid-cols-3 gap-12">
            <a href="#features" className="text-white font-bold text-lg">Features</a>
            <a href="#how-it-works" className="text-white font-bold text-lg">How It Works</a>
            <a href="#faq" className="text-white font-bold text-lg">FAQ</a>
          </div>
          
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
            <button
              onClick={() => setWaitlistOpen(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Join Waitlist
            </button>
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
            Turn job descriptions into career action plans. 
            Get actionable insights, identify gaps, and land your next opportunity
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <button
                onClick={() => setWaitlistOpen(true)}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Join Waitlist
              </button>
            )}
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
      <Features />

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-gradient-to-tr from-slate-900 via-purple-900 to-slate-900 py-20 border-t border-purple-700/30">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block px-4 py-2 rounded-full border border-purple-500/30 mb-6">
              <span className="text-purple-300 text-sm font-semibold">⚙️ How It Works</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              It's That Simple. Just Upload,
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                and Let AI Do the Rest.
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              ResAlign AI fits into your job search — not the other way around.
              <br />
              Here's how to get started:
            </p>
          </div>

          {/* Steps Container */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-2">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1 max-w-sm">
              <div className="mb-8 text-center">
                <div className="text-9xl font-bold bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                  1
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Upload Your Resume</h3>
                <p className="text-gray-400">
                  Drop in your resume and job description.
                </p>
              </div>
            </div>

            {/* Arrow 1 - Hidden on mobile */}
            <div className="hidden md:flex items-center justify-center mb-24">
              <div className="text-4xl text-purple-400">→</div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1 max-w-sm">
              <div className="mb-8 text-center">
                <div className="text-9xl font-bold bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
                  2
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Let AI Analyze & Match</h3>
                <p className="text-gray-400">
                  ResAlign AI automatically analyzes your resume, identifies your strengths, and calculates your job fit score instantly.
                </p>
              </div>
            </div>

            {/* Arrow 2 - Hidden on mobile */}
            <div className="hidden md:flex items-center justify-center mb-24">
              <div className="text-4xl text-purple-400">→</div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1 max-w-sm">
              <div className="mb-8 text-center">
                <div className="text-9xl font-bold bg-gradient-to-br from-pink-400 to-rose-400 bg-clip-text text-transparent mb-6">
                  3
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Get Your Roadmap & Act</h3>
                <p className="text-gray-400">
                  Receive actionable insights, personalized recommendations, and learning resources tailored to bridge your gaps and land the role.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <div id="cta" className="
        bg-gradient-to-bl from-slate-900 via-purple-900 to-slate-900 
        py-20 px-6 border-t border-purple-700/30">
        <div className="max-w-7xl mx-auto">
          <div className="border border-purple-500/30 rounded-3xl backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-blue-500/10 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-12 items-center p-8 md:p-16">
              {/* Left Content */}
              <div className="flex flex-col justify-center">
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Ready to Get Out of Your
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Head and Into Action?
                  </span>
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Stop guessing about your fit. Start executing with clarity and confidence.
                </p>
                <div>
                  {user ? (
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all text-lg"
                    >
                      Go to Dashboard <span className="text-2xl">→</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => setWaitlistOpen(true)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all text-lg"
                    >
                      Join Waitlist <span className="text-2xl">→</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Preview - Dashboard Mockup */}
              <div className="relative hidden md:block">
                <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/50 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
                  {/* Mock Dashboard */}
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <div className="h-3 bg-purple-400/30 rounded w-24"></div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-3">
                      {/* Score Card */}
                      <div className="bg-slate-700/30 rounded-lg p-4 border border-purple-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Job Match Score</span>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                            92%
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                          <div className="h-full w-11/12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                        </div>
                      </div>

                      {/* Skills Breakdown */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-700/30 rounded-lg p-3 border border-purple-500/20">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Technical</span>
                            <span className="text-sm font-semibold text-purple-400">88%</span>
                          </div>
                          <div className="h-1 bg-slate-600 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full w-10/12 bg-purple-400 rounded-full"></div>
                          </div>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3 border border-purple-500/20">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Experience</span>
                            <span className="text-sm font-semibold text-blue-400">95%</span>
                          </div>
                          <div className="h-1 bg-slate-600 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full w-11/12 bg-blue-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-slate-700/30 rounded-lg p-3 border border-purple-500/20">
                        <div className="text-xs text-gray-400 mb-2">Recommended Next Steps</div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                            <span className="text-xs text-gray-300">Learn System Design</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                            <span className="text-xs text-gray-300">Advanced React Patterns</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glowing effect */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full blur-3xl opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-bl from-purple-900 via-slate-900 to-slate-900 border-t border-purple-700/30">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-8">
          <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-16">
            {/* Logo and Branding */}
            <div className="flex flex-col gap-6 md:w-1/4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg  flex items-center justify-center">
                  <img src={logo} alt="logo" className="w-8 h-8" />
                </div>
                <span className="text-white font-bold text-xl">ResAlign AI</span>
              </div>
            </div>

            {/* Footer Links Grid */}
            <div className="grid grid-cols-3 gap-8 md:gap-16 md:w-3/4">
              {/* Product Column */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-6">Product</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</a></li>
                </ul>
              </div>

              {/* Company Column */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-6">Legal Stuff</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a></li>
                </ul>
              </div>

              {/* Community Column */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-6">Contact</h3>
                <ul className="space-y-3">
                  <li><a href="https://github.com/nikhil-kadapala/resalign-ai" target="_blank" className="text-gray-400 hover:text-white transition-colors text-sm">GitHub</a></li>
                  <li><a href="https://www.linkedin.com/in/nikhil-kadapala/" target="_blank" className="text-gray-400 hover:text-white transition-colors text-sm">LinkedIn</a></li>
                  <li><a href="https://x.com/nikhil_kadapala" target="_blank" className="text-gray-400 hover:text-white transition-colors text-sm">X</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 mt-8 md:mt-4 pt-2">
            <p className="text-gray-500 text-sm text-center md:text-left">&copy; 2025 ResAlign AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Waitlist Modal */}
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  )
}
