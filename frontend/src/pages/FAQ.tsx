import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How does ResAlign AI actually work?',
    answer: 'You upload your resume and a job description you\'re interested in. Our AI instantly analyzes both documents across five critical dimensions: skills match, experience alignment, education & certifications, achievements & outcomes, and soft skills & culture fit. Instead of just counting keyword matches, we understand context—like how "3 years of backend development" relates to a senior role requiring 5+ years. In seconds, you get a compatibility score (0-100) and detailed insights showing exactly where you excel and where you might have gaps. It\'s like having a career coach review your profile against each opportunity in real-time.',
  },
  {
    id: 'faq-2',
    question: 'Why shouldn\'t I just apply everywhere and hope for the best?',
    answer: 'Because it\'s a waste of your most valuable resource: time. The traditional approach means spending hours on applications, customizing cover letters, and waiting weeks for rejection emails. ResAlign AI eliminates the guesswork by showing you your actual fit percentage before you invest time. Users report finding roles with 75%+ compatibility have significantly better interview conversion rates. By focusing on opportunities where you\'re genuinely aligned, you spend less time applying and more time preparing for roles you\'re actually likely to land. That\'s the difference between quantity and strategy.',
  },
  {
    id: 'faq-3',
    question: 'What if I see a gap in my skills? Can I actually fix it?',
    answer: 'Absolutely—and this is where ResAlign AI becomes a career accelerator, not just an analyzer. When you identify a skill gap (like "Python experience" for a role you want), our AI generates personalized action plans showing you exactly what to learn, why it matters for that role, and how to develop it efficiently. Instead of wondering "should I learn this?", you have proof that closing this gap increases your fit score and job prospects. Users see average skill improvements within 3-6 months by following these targeted recommendations. You\'re not just applying to jobs—you\'re systematically building the career you want.',
  },
  {
    id: 'faq-4',
    question: 'How is ResAlign different from ATS checkers or generic resume tools?',
    answer: 'Most resume tools are one-dimensional—they count keywords. ResAlign AI is dimensional. It understands your entire profile holistically. We don\'t penalize you for not using exact keywords if your experience clearly shows that skill. We recognize that "React/Vue developer" is similar to "frontend engineer." We understand industry nuances—a startup "VP of Sales" might align better with a mid-size company\'s "Head of Sales" than the title suggests. We score five dimensions independently so you see not just a number, but the story of your fit. You get the "why" behind the score, not just the score itself.',
  },
  {
    id: 'faq-5',
    question: 'Can I see how I stack up against multiple opportunities?',
    answer: 'Yes—this is powerful. Compare your resume against 10, 20, or 100 different job descriptions to find your sweet spot. Your dashboard shows all analyses side-by-side so you can identify patterns: "I\'m strongest in product manager roles" or "My experience aligns best with early-stage startups." This helps you make strategic career decisions rather than reactive ones. You\'ll discover which companies, industries, and roles are genuinely aligned with your background, saving you from wasting applications on poor fits. It\'s market research on your own career.',
  },
  {
    id: 'faq-6',
    question: 'What if my resume is outdated or needs improvements?',
    answer: 'ResAlign makes this obvious. When your score against a role you really want is lower than you\'d like, the analysis shows exactly why. Maybe your resume doesn\'t highlight a key skill you actually have, or you\'re missing certifications that matter. You can then strategically update your resume and re-upload it. ResAlign instantly recalculates your fit against all the jobs you\'ve saved, showing you the impact of your changes in real-time. You\'re not guessing about what improvements matter—you\'re optimizing based on the roles you actually want.',
  },
  {
    id: 'faq-7',
    question: 'Is my resume data actually safe with you?',
    answer: `Your privacy is fundamental to how we operate. Here's exactly how we protect your data:

🔒 Secure Storage
All your resumes and job descriptions are stored in Supabase, an enterprise-grade database provider. Data is encrypted in transit (HTTPS) and at rest.

🛡️ PII Masking for AI
Before we send any data to our AI analysis service, we automatically mask all personally identifiable information. Email addresses, phone numbers, URLs, LinkedIn profiles, and social handles are replaced with anonymous placeholders. Your actual personal information never leaves your secure account.

🚫 No Data Selling
We NEVER sell, share, or rent your data to recruiters, employers, or third parties.

⚙️ Complete Control
Your resume and analysis history are only visible to you via Row-Level Security policies. You can request a copy of all your data anytime or delete everything with one click.

🔍 Transparent AI Processing
We use Google's Gemini API for intelligent matching, but only anonymized versions of your resume and job descriptions are sent (with PII masked). Your actual contact info, email, and phone number never reach external AI systems.

For complete details, read our Privacy Policy and Terms of Service. We're committed to earning and keeping your trust.`,
  },
  {
    id: 'faq-8',
    question: 'How fast is the analysis really?',
    answer: 'Most analyses complete in 5-10 seconds. You upload both documents, hit analyze, and within seconds you see your fit score and detailed breakdown. No waiting for email confirmations, no "results coming soon" messages. This speed matters because it removes friction from your decision-making. You can quickly assess 5-10 opportunities in your lunch break instead of spending an evening researching job descriptions. The real-time nature means you can explore "what-if" scenarios: "What if I positioned my experience differently?" Upload, analyze, see the score—all in seconds.',
  },
  {
    id: 'faq-9',
    question: 'What happens after I get my compatibility score?',
    answer: 'The score is just the beginning. You get a detailed breakdown showing: (1) Which skills you have that the role needs, (2) Skills the role wants that you\'re missing, (3) How your experience level stacks up, (4) Cultural and soft skill alignment, and (5) Specific, actionable recommendations to improve your fit. If the score is 70%+, you\'re looking at a realistic opportunity—focus your energy here. If it\'s 60-70%, you\'re close—our recommendations show exactly what to work on. If it\'s below 60%, you might want to keep looking or invest time developing those gaps. You\'re making informed strategic decisions instead of emotional ones.',
  },
  {
    id: 'faq-10',
    question: 'Can I share my analysis with mentors or get feedback?',
    answer: 'Yes. You can export your analysis to share with mentors, career coaches, or friends for feedback. "Look, I want this role but I\'m only 68% aligned. Here\'s where my gaps are—what should I prioritize?" This collaborative element transforms ResAlign from a solo tool into a career development partner. Your mentors can see the same breakdown you see and give targeted advice. Many users report that this structured analysis generates much better mentoring conversations than vague "how do I land this job?" questions.',
  },
  {
    id: 'faq-11',
    question: 'How do I know if ResAlign will actually help me land jobs?',
    answer: `
💡 Here's what we know: Users who focus on roles with 75%+ compatibility score have 3x better callback rates than those applying broadly. 

🤔 Why? Because higher compatibility means you're genuinely qualified, you'll interview with confidence, and you'll be a strong candidate among the finalists. 

👀 You're not hoping to sneak past ATS filters or fake experience levels. You're going into interviews prepared to talk about genuine alignment. That preparation, combined with strategic job selection, converts to offers. 

✅ The best career move isn't applying to more jobs—it's applying to the right ones. ResAlign helps you find those.`,
  },
  {
    id: 'faq-12',
    question: 'What if I\'m changing careers or industries?',
    answer: `💡 This is where ResAlign shines for career changers. 

🥷 Your direct experience might not match new roles, but your transferable skills do. 

✅ ResAlign understands this. You might be a project manager in manufacturing applying to product roles at tech startups. Your PM skills are gold, but the language is different. 

👌 ResAlign recognizes this contextual alignment instead of just looking for tech startup experience. It shows you exactly which of your existing skills transfer and which ones you need to develop. 

🎢 Career changes go from impossible to here's your strategic roadmap. You see proof that your background is more valuable than you thought.`,
  },
  {
    id: 'faq-13',
    question: 'How often should I use ResAlign?',
    answer: `💡 Use it for every opportunity you're serious about.

🤩 Spotted a role that interests you? Before spending 30 minutes customizing your application, run it through ResAlign.

🕒 Takes 2 minutes to get clarity on whether it's worth pursuing. 

👨‍💻 Many power users run analyses daily as they browse job boards. 

🎯 The goal isn't to use ResAlign constantly—it's to use it strategically before major time investments. 

📄Each analysis teaches you more about your market value and positioning. 

🚀 After 10-15 analyses, you'll see clear patterns in what roles and companies fit your profile, which dramatically accelerates your search effectiveness.`,
  },
  {
    id: 'faq-14',
    question: 'What file formats do you support?',
    answer: 'We support PDF, DOCX (Microsoft Word), and plain text files for both resumes and job descriptions. You can upload resume files directly, paste job descriptions as text, or share a URL and we\'ll extract the content. Works with LinkedIn job postings, company career pages, job boards like Indeed—anywhere you find opportunities. Maximum file size is 10MB (covers 99%+ of resumes and job descriptions). This flexibility means ResAlign fits your workflow, not the other way around.',
  },
  {
    id: 'faq-15',
    question: 'I\'m worried about having my data on yet another platform. Why should I trust you?',
    answer: `Fair question. Here's our commitment:

✅ Transparency
Read our full Privacy Policy and Terms of Service before signing up. We hide nothing.

✅ No Data Monetization
No selling to recruiters, no AI training on your resume, no ads based on your data.

✅ Absolute Control
Delete your account and all data permanently with one click. Your data is yours.

✅ Enterprise Security
We use Supabase (not homegrown solutions) for industry-standard security practices.

✅ Compliance & Auditability
Our infrastructure is designed for compliance with GDPR, CCPA, and other privacy laws.

We're betting our business on trust. If we violate it, we lose everything. You can validate this by reading our privacy policy and security practices. We have nothing to hide.`,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export const FAQ = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1')

  const toggleOpen = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <div id="faq" className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24 border-t border-purple-700/50">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={headerVariants}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 mb-6">
            <span className="text-purple-300 text-sm font-semibold">❓ FAQs</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            You've Got Questions.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              We've Got Answers.
            </span>
          </h2>
          <p className="text-xl text-gray-300 mt-4">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="space-y-3"
        >
          <AnimatePresence mode="wait">
            {faqItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="border border-purple-500/20 rounded-lg overflow-hidden transition-all duration-300"
              >
                {/* Question Button */}
                <motion.button
                  onClick={() => toggleOpen(item.id)}
                  whileHover={{ backgroundColor: 'rgba(30, 27, 75, 0.6)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 flex items-center justify-between bg-slate-800/40 transition-colors text-left group"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {item.question}
                  </h3>
                  <motion.div 
                    className="flex-shrink-0 flex items-center justify-center"
                    animate={{ rotate: openId === item.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg
                      className="w-6 h-6 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.div>
                </motion.button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {openId === item.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-t border-purple-500/20">
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.3 }}
                          className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                        >
                          {item.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
