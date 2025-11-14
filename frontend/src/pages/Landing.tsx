'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '@/hooks/useAuth'
import { Features } from '@/pages/Features'
import { FAQ } from '@/pages/FAQ'
import { WaitlistModal } from '@/components/WaitlistModal'
import { Navbar } from '@/pages/Navbar'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
}

const titleVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
}


export const Home = () => {
  const { user } = useAuth()
  const [waitlistOpen, setWaitlistOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar onWaitlistClick={() => setWaitlistOpen(true)} />

      {/* Hero Section */}
      <div className="min-w-screen mx-auto px-6 md:py-32 
        dark:bg-linear-to-b dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="text-center space-y-8"
        >
          <motion.h1
            variants={titleVariants}
            className="text-5xl md:text-7xl font-bold text-foreground leading-tight"
          >
            Align Your Skills With
            <span className="text-primary block">
              {' '}Your Dream Job
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed py-10"
          >
            AI-powered resume analysis that matches your skills to job descriptions.
            Turn job descriptions into career action plans.
            Get actionable insights, identify gaps, and land your next opportunity
          </motion.p>

          <motion.div
            variants={containerVariants}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                <a
                  href="/dashboard"
                  className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Go to Dashboard
                </a>
              </motion.div>
            ) : (
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWaitlistOpen(true)}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all cursor-pointer"
              >
                Join Waitlist
              </motion.button>
            )}
            <motion.a
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#how-it-works"
              className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-all cursor-pointer"
            >
              Learn More
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <Features />

      {/* How It Works Section */}
      <div id="how-it-works" className="dark:bg-linear-to-b dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-block px-4 py-2 rounded-full border border-primary/30 mb-6">
              <span className="text-primary text-sm font-semibold">⚙️ How It Works</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              It&apos;s That Simple. Just Upload,
              <br />
              <span className="text-primary">
                and Let AI Do the Rest.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              ResAlign AI fits into your job search — not the other way around.
              <br />
              Here&apos;s how to get started:
            </p>
          </motion.div>

          {/* Steps Container */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-2">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0 }}
              className="flex flex-col items-center flex-1 max-w-sm"
            >
              <div className="mb-8 text-center">
                <motion.div
                  className="text-9xl font-bold text-primary mb-6"
                  whileInView={{ scale: [0.8, 1.1, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  1
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Upload Your Resume</h3>
                <p className="text-muted-foreground">
                  Drop in your resume and job description.
                </p>
              </div>
            </motion.div>

            {/* Arrow 1 */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.2 }}
              className="hidden md:flex items-center justify-center mb-24"
            >
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-4xl text-primary"
              >
                →
              </motion.div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col items-center flex-1 max-w-sm"
            >
              <div className="mb-8 text-center">
                <motion.div
                  className="text-9xl font-bold text-primary mb-6"
                  whileInView={{ scale: [0.8, 1.1, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  2
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Let AI Analyze & Match</h3>
                <p className="text-muted-foreground">
                  ResAlign AI automatically analyzes your resume, identifies your strengths, and calculates your job fit score instantly.
                </p>
              </div>
            </motion.div>

            {/* Arrow 2 */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex items-center justify-center mb-24"
            >
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                className="text-4xl text-purple-400"
              >
                →
              </motion.div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center flex-1 max-w-sm"
            >
              <div className="mb-8 text-center">
                <motion.div
                  className="text-9xl font-bold text-primary mb-6"
                  whileInView={{ scale: [0.8, 1.1, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  3
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Get Your Roadmap & Act</h3>
                <p className="text-muted-foreground">
                  Receive actionable insights, personalized recommendations, and learning resources tailored to bridge your gaps and land the role.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <div id="cta" className="dark:bg-linear-to-b dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="dark:border dark:border-border border border-slate-500 shadow-lg rounded-3xl backdrop-blur-sm 
            dark:bg-linear-to-tr dark:from-background dark:via-zinc-900 dark:to-zinc-950 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-12 items-center p-8 md:p-16">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="flex flex-col justify-center"
              >
                <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Ready to Get Out of Your
                  <br />
                  <span className="text-primary">
                    Head and Into Action?
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Stop guessing about your fit. Start executing with clarity and confidence.
                </p>
                <div>
                  {user ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer w-fit"
                    >
                      <a
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-lg cursor-pointer"
                      >
                        Go to Dashboard <span className="text-2xl">→</span>
                      </a>
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setWaitlistOpen(true)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-lg cursor-pointer"
                    >
                      Join Waitlist <span className="text-2xl">→</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Right Preview - Dashboard Mockup */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative hidden md:block"
              >
                <motion.div
                  className="bg-card rounded-2xl p-6 border border-border backdrop-blur-sm"
                  whileInView={{ y: [0, -10, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {/* Mock Dashboard */}
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="h-3 bg-primary/30 rounded w-24"></div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-3">
                      {/* Score Card */}
                      <div className="bg-muted rounded-lg p-4 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Job Match Score</span>
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                            92%
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-11/12 bg-primary rounded-full"></div>
                        </div>
                      </div>

                      {/* Skills Breakdown */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted rounded-lg p-3 border border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Technical</span>
                            <span className="text-sm font-semibold text-primary">88%</span>
                          </div>
                          <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full w-10/12 bg-primary rounded-full"></div>
                          </div>
                        </div>
                        <div className="bg-muted rounded-lg p-3 border border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Experience</span>
                            <span className="text-sm font-semibold text-primary">95%</span>
                          </div>
                          <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full w-11/12 bg-primary rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-muted rounded-lg p-3 border border-border">
                        <div className="text-xs text-muted-foreground mb-2">Recommended Next Steps</div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            <span className="text-xs text-foreground">Learn System Design</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            <span className="text-xs text-foreground">Advanced React Patterns</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Glowing effect */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary rounded-full blur-3xl opacity-10"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="dark:bg-linear-to-br dark:from-background dark:via-zinc-900 dark:to-zinc-950 dark:border-t dark:border-border
      border border-neutral-300">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-8">
          <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-16">
            {/* Logo and Branding */}
            <div className="flex flex-col gap-3 md:w-1/4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  RA
                </div>
                <span className="text-foreground font-bold text-xl">ResAlign AI</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">Align your resume and skills to land the job. Turn job descriptions into career action plans. Accelerate your career.</p>
            </div>

            {/* Footer Links Grid */}
            <div className="grid grid-cols-3 gap-8 md:gap-16 md:w-3/4">
              {/* Product Column */}
              <div>
                <h3 className="text-foreground font-semibold text-sm mb-6">Product</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">About</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Features</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">FAQ</a></li>
                </ul>
              </div>

              {/* Company Column */}
              <div>
                <h3 className="text-foreground font-semibold text-sm mb-6">Legal Stuff</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Privacy Policy</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Terms of Service</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Cookie Policy</a></li>
                </ul>
              </div>

              {/* Empty Column */}
              <div />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border mt-8 md:mt-4 pt-2">
            <p className="text-muted-foreground text-sm text-center md:text-left">&copy; 2025 ResAlign AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Waitlist Modal */}
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  )
}