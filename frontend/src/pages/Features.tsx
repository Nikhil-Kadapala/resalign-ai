import { motion } from 'motion/react'

const featureItemVariants = {
  hidden: { opacity: 0, x: -30 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6 },
  },
}

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

export const Features = () => {
    return (
        <div id="features" className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header Section */}
            <div className="max-w-6xl mx-auto px-6 py-20">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-20"
                >
                    <div className="inline-block px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 mb-6">
                        <span className="text-purple-300 text-sm font-semibold">✨ Features</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        You Focus on Your Career
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            We Handle the Analysis
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        ResAlign AI handles the heavy lifting of resume analysis and job matching, 
                        giving you clarity and momentum from day one.
                    </p>
                </motion.div>

                {/* Feature 1: Smart Resume Analysis */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className="mt-32 border-t border-purple-700/30 pt-20"
                >
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                          initial="hidden"
                          whileInView="show"
                          viewport={{ once: true, margin: '-100px' }}
                          variants={containerVariants}
                        >
                            <motion.div variants={featureItemVariants} className="inline-block px-3 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 mb-4">
                                <span className="text-blue-300 text-xs font-semibold">01. ANALYSIS</span>
                            </motion.div>
                            <motion.h2 variants={featureItemVariants} className="text-4xl font-bold text-white mb-6">
                                Intelligent Resume Parsing
                            </motion.h2>
                            <motion.p variants={featureItemVariants} className="text-lg text-gray-300 mb-8">
                                No more manual skill extraction. Our advanced AI instantly analyzes your resume, 
                                identifying core competencies, experience levels, and hidden strengths you might overlook.
                            </motion.p>
                            <motion.ul variants={containerVariants} className="space-y-4">
                                {[
                                  { title: 'Instant Extraction', desc: 'Parse skills, experience, and certifications automatically' },
                                  { title: 'Context Understanding', desc: 'AI understands context and relevance of your experience' },
                                  { title: 'Skill Normalization', desc: 'Converts varied skill descriptions to industry standards' },
                                ].map((item, i) => (
                                  <motion.li key={i} variants={featureItemVariants} className="flex items-start gap-3">
                                      <span className="text-purple-400 text-xl mt-1">→</span>
                                      <div>
                                          <p className="text-white font-semibold">{item.title}</p>
                                          <p className="text-gray-400 text-sm">{item.desc}</p>
                                      </div>
                                  </motion.li>
                                ))}
                            </motion.ul>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true, margin: '-100px' }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          className="relative"
                        >
                            <motion.div 
                              className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm"
                              whileInView={{ y: [0, -8, 0] }}
                              viewport={{ once: true }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                                <div className="space-y-4">
                                    <div className="h-4 bg-purple-400/30 rounded w-3/4"></div>
                                    <div className="h-4 bg-blue-400/30 rounded w-full"></div>
                                    <div className="h-4 bg-purple-400/30 rounded w-4/5"></div>
                                    <div className="h-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded mt-6"></div>
                                    <div className="space-y-2 mt-6">
                                        <div className="h-3 bg-purple-400/20 rounded w-2/3"></div>
                                        <div className="h-3 bg-purple-400/20 rounded w-3/4"></div>
                                        <div className="h-3 bg-purple-400/20 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </motion.div>
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-3xl opacity-30"></div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Feature 2: Smart Matching */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className="mt-32 border-t border-purple-700/30 pt-20"
                >
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true, margin: '-100px' }}
                          transition={{ duration: 0.6 }}
                          className="relative order-2 md:order-1"
                        >
                            <motion.div 
                              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm"
                              whileInView={{ y: [0, -8, 0] }}
                              viewport={{ once: true }}
                              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="h-4 bg-purple-400/30 rounded w-1/3"></div>
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                                            92%
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full w-11/12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                                    </div>
                                    <div className="mt-6 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Technical Skills Match</span>
                                            <span className="text-green-400">88%</span>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full">
                                            <div className="h-full w-10/12 bg-green-400 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Experience Level Match</span>
                                            <span className="text-blue-400">95%</span>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full">
                                            <div className="h-full w-11/12 bg-blue-400 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full blur-3xl opacity-30"></div>
                        </motion.div>
                        <motion.div 
                          initial="hidden"
                          whileInView="show"
                          viewport={{ once: true, margin: '-100px' }}
                          variants={containerVariants}
                          className="order-1 md:order-2"
                        >
                            <motion.div variants={featureItemVariants} className="inline-block px-3 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 mb-4">
                                <span className="text-purple-300 text-xs font-semibold">02. MATCHING</span>
                            </motion.div>
                            <motion.h2 variants={featureItemVariants} className="text-4xl font-bold text-white mb-6">
                                Precise Job Fit Scoring
                            </motion.h2>
                            <motion.p variants={featureItemVariants} className="text-lg text-gray-300 mb-8">
                                Get detailed compatibility scores that go beyond keyword matching. Our AI evaluates 
                                your qualifications against job requirements with nuanced understanding.
                            </motion.p>
                            <motion.ul variants={containerVariants} className="space-y-4">
                                {[
                                  { title: 'Multi-Dimensional Scoring', desc: 'Technical skills, experience, soft skills, and more' },
                                  { title: 'Gap Identification', desc: 'See exactly what skills you need to develop' },
                                  { title: 'Real-Time Updates', desc: 'Scores update instantly as job requirements change' },
                                ].map((item, i) => (
                                  <motion.li key={i} variants={featureItemVariants} className="flex items-start gap-3">
                                      <span className="text-purple-400 text-xl mt-1">→</span>
                                      <div>
                                          <p className="text-white font-semibold">{item.title}</p>
                                          <p className="text-gray-400 text-sm">{item.desc}</p>
                                      </div>
                                  </motion.li>
                                ))}
                            </motion.ul>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Feature 3: Actionable Recommendations */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className="mt-32 border-t border-purple-700/30 pt-20"
                >
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                          initial="hidden"
                          whileInView="show"
                          viewport={{ once: true, margin: '-100px' }}
                          variants={containerVariants}
                        >
                            <motion.div variants={featureItemVariants} className="inline-block px-3 py-1 rounded-lg border border-green-500/30 bg-green-500/10 mb-4">
                                <span className="text-green-300 text-xs font-semibold">03. GROWTH</span>
                            </motion.div>
                            <motion.h2 variants={featureItemVariants} className="text-4xl font-bold text-white mb-6">
                                Personalized Learning Paths
                            </motion.h2>
                            <motion.p variants={featureItemVariants} className="text-lg text-gray-300 mb-8">
                                Don't just see your gaps—close them. Get AI-generated recommendations for courses, 
                                projects, and skills to bridge the distance between your current profile and dream role.
                            </motion.p>
                            <motion.ul variants={containerVariants} className="space-y-4">
                                {[
                                  { title: 'Curated Resources', desc: 'Handpicked courses from Coursera, Udemy, LinkedIn Learning' },
                                  { title: 'Priority-Based Recommendations', desc: 'Focus on the skills that matter most for your target role' },
                                  { title: 'Progress Tracking', desc: 'Monitor your improvement with analytics dashboards' },
                                ].map((item, i) => (
                                  <motion.li key={i} variants={featureItemVariants} className="flex items-start gap-3">
                                      <span className="text-purple-400 text-xl mt-1">→</span>
                                      <div>
                                          <p className="text-white font-semibold">{item.title}</p>
                                          <p className="text-gray-400 text-sm">{item.desc}</p>
                                      </div>
                                  </motion.li>
                                ))}
                            </motion.ul>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true, margin: '-100px' }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          className="relative"
                        >
                            <motion.div 
                              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm"
                              whileInView={{ y: [0, -8, 0] }}
                              viewport={{ once: true }}
                              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                            >
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white font-semibold text-sm">Recommended Path</span>
                                            <span className="text-green-400 text-xs">3 months</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center text-white text-xs">✓</div>
                                                <span className="text-gray-300 text-sm">Advanced React Patterns</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-purple-400/50 flex items-center justify-center text-white text-xs">2</div>
                                                <span className="text-gray-300 text-sm">System Design Basics</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">3</div>
                                                <span className="text-gray-400 text-sm">Docker & Kubernetes</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-gray-700/50">
                                        <p className="text-gray-400 text-xs mb-3">Time Investment: 8-10 hrs/week</p>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full w-1/3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full blur-3xl opacity-30"></div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Feature 4: Interview Preparation */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className="mt-32 border-t border-purple-700/30 pt-20 pb-20"
                >
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true, margin: '-100px' }}
                          transition={{ duration: 0.6 }}
                          className="relative order-2 md:order-1"
                        >
                            <motion.div 
                              className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm"
                              whileInView={{ y: [0, -8, 0] }}
                              viewport={{ once: true }}
                              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                                        <span className="text-orange-300 text-sm font-semibold">Interview Questions</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-gray-800/50 rounded p-3">
                                            <p className="text-gray-300 text-sm font-semibold mb-2">Q: Tell us about your experience with system architecture</p>
                                            <p className="text-gray-400 text-xs">Based on job description matching</p>
                                        </div>
                                        <div className="bg-gray-800/50 rounded p-3">
                                            <p className="text-gray-300 text-sm font-semibold mb-2">Q: How do you handle performance optimization?</p>
                                            <p className="text-gray-400 text-xs">Based on job description matching</p>
                                        </div>
                                        <div className="bg-gray-800/50 rounded p-3">
                                            <p className="text-gray-300 text-sm font-semibold mb-2">Q: Describe a challenging project...</p>
                                            <p className="text-gray-400 text-xs">Based on job description matching</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-orange-600 to-red-600 rounded-full blur-3xl opacity-30"></div>
                        </motion.div>
                        <motion.div 
                          initial="hidden"
                          whileInView="show"
                          viewport={{ once: true, margin: '-100px' }}
                          variants={containerVariants}
                          className="order-1 md:order-2"
                        >
                            <motion.div variants={featureItemVariants} className="inline-block px-3 py-1 rounded-lg border border-orange-500/30 bg-orange-500/10 mb-4">
                                <span className="text-orange-300 text-xs font-semibold">04. INTERVIEW PREP</span>
                            </motion.div>
                            <motion.h2 variants={featureItemVariants} className="text-4xl font-bold text-white mb-6">
                                AI-Generated Interview Questions
                            </motion.h2>
                            <motion.p variants={featureItemVariants} className="text-lg text-gray-300 mb-8">
                                Walk into interviews prepared. Our AI generates role-specific interview questions 
                                based on the job description and your profile, with suggested talking points.
                            </motion.p>
                            <motion.ul variants={containerVariants} className="space-y-4">
                                {[
                                  { title: 'Role-Specific Questions', desc: 'Tailored to the exact position you\'re applying for' },
                                  { title: 'Talking Points', desc: 'AI-suggested answers and examples to highlight' },
                                  { title: 'Practice Mode', desc: 'Mock interview simulations with real-time feedback' },
                                ].map((item, i) => (
                                  <motion.li key={i} variants={featureItemVariants} className="flex items-start gap-3">
                                      <span className="text-purple-400 text-xl mt-1">→</span>
                                      <div>
                                          <p className="text-white font-semibold">{item.title}</p>
                                          <p className="text-gray-400 text-sm">{item.desc}</p>
                                      </div>
                                  </motion.li>
                                ))}
                            </motion.ul>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}