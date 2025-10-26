import { useState } from 'react'

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How is ResAlign different from other resume tools?',
    answer: 'ResAlign AI uses advanced machine learning to go beyond simple keyword matching. Our AI understands context, interprets skill relevance, and provides nuanced job fit scoring based on multiple dimensions including technical skills, experience level, soft skills, and growth potential. We don\'t just match keywords—we match careers.',
  },
  {
    id: 'faq-2',
    question: 'Is my resume data secure?',
    answer: 'Absolutely. Your resume and all personal data are encrypted in transit and at rest using industry-standard AES-256 encryption. We never sell, share, or use your data for any purpose other than providing our service. Your data is only accessible to you, and you can delete everything at any time with a single click.',
  },
  {
    id: 'faq-3',
    question: 'How long does the analysis take?',
    answer: 'Analysis is instant. Once you upload your resume and a job description, ResAlign AI processes and scores your fit in under 10 seconds. Our real-time scoring updates automatically as you modify your resume or explore different job listings.',
  },
  {
    id: 'faq-4',
    question: 'Can I analyze multiple job descriptions?',
    answer: 'Yes! You can analyze your resume against unlimited job descriptions. Compare your fit across different roles, industries, and companies. Our dashboard keeps track of all your analyses so you can revisit scores anytime and see how your qualifications stack up against different opportunities.',
  },
  {
    id: 'faq-5',
    question: 'Do I need to manually update my profile?',
    answer: 'No. Simply upload your latest resume, and ResAlign automatically extracts all your information. When you update your resume and re-upload, we detect changes and recalculate your fit scores against all your saved job descriptions instantly.',
  },
  {
    id: 'faq-6',
    question: 'What formats do you support?',
    answer: 'We support PDF, DOCX (Microsoft Word), and plain text files for both resumes and job descriptions. You can copy-paste job descriptions directly, upload them as files, or share a URL and we\'ll extract the content for you.',
  },
]

export const FAQ = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1')

  const toggleOpen = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <div id="faq" className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24 border-t border-purple-700/50">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
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
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqItems.map((item) => (
            <div
              key={item.id}
              className="border border-purple-500/20 rounded-lg overflow-hidden transition-all duration-300"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleOpen(item.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/60 transition-colors text-left group"
              >
                <h3 className="text-lg font-semibold text-white pr-4">
                  {item.question}
                </h3>
                <div className="flex-shrink-0 flex items-center justify-center">
                  <svg
                    className={`w-6 h-6 text-purple-400 transition-transform duration-300 ${
                      openId === item.id ? 'rotate-180' : ''
                    }`}
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
                </div>
              </button>

              {/* Answer */}
              {openId === item.id && (
                <div className="px-6 py-4 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-t border-purple-500/20">
                  <p className="text-gray-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
