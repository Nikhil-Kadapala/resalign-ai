import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Loader, CheckCircle } from 'lucide-react'

interface WaitlistModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
}

const successVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5 },
  },
}

const checkmarkVariants = {
  hidden: { scale: 0, rotate: -180 },
  show: {
    scale: 1,
    rotate: 0,
    transition: { delay: 0.2, duration: 0.6 },
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.5, delay: 0.8 },
  },
}

export const WaitlistModal = ({ open, onOpenChange }: WaitlistModalProps) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setEmail('')
        setName('')
        setSubmitSuccess(false)
      }, 300) // Delay to allow modal close animation
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !name) {
      toast.error('Please fill in all fields')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      // Check if email already exists
      const { data: existing, error: checkError } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()
      
      if (checkError) {
        console.error('Error checking for existing email:', checkError)
        throw checkError
      }

      // Only insert if email doesn't exist
      if (!existing) {
        const { error: insertError } = await supabase
          .from('waitlist')
          .insert({
            email: email.toLowerCase().trim(),
            name: name.trim(),
          })

        // Handle duplicate key error gracefully (race condition or concurrent requests)
        if (insertError) {
          // Error code 23505 is PostgreSQL unique constraint violation
          if (insertError.code === '23505') {
            console.log('Email already exists in waitlist (race condition)')
            // Continue to show success - user is already on the list
          } else {
            throw insertError
          }
        } else {
          // Only send email if this was a new insertion
          try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
            const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
            
            const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-waitlist-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                name: name.trim(),
                email: email.toLowerCase().trim(),
              }),
            })

            if (!emailResponse.ok) {
              const errorText = await emailResponse.text()
              console.error('Failed to send confirmation email:', errorText)
              // Don't throw error - user is still on waitlist even if email fails
            } else {
              console.log('Confirmation email sent successfully')
            }
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError)
            // Don't throw error - user is still on waitlist even if email fails
          }
        }
      } else {
        console.log('Email already exists in waitlist')
      }

      // Show success regardless of whether it was a new or existing email
      setSubmitSuccess(true)

      // Auto-close after 3 seconds
      setTimeout(() => {
        onOpenChange(false)
      }, 3000)
    } catch (error) {
      console.error('Error submitting to waitlist:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to join waitlist. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence mode="wait">
        {open && (
          <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30 p-0 overflow-hidden">
            {submitSuccess ? (
              // Success State
              <motion.div
                key="success"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={successVariants}
                className="py-8 text-center px-6"
              >
                <motion.div 
                  className="flex justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center"
                    variants={checkmarkVariants}
                    initial="hidden"
                    animate={["show", "pulse"]}
                  >
                    <motion.div
                      variants={checkmarkVariants}
                      initial="hidden"
                      animate={["show", "pulse"]}
                    >
                      <CheckCircle className="w-8 h-8 text-white" />
                    </motion.div>
                  </motion.div>
                </motion.div>
                <DialogHeader>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <DialogTitle className="text-2xl text-white text-center mb-2">
                      You're on the list! 🎉
                    </DialogTitle>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <DialogDescription className="text-gray-300 text-center text-base">
                      We'll notify you when ResAlign AI launches. Get ready to transform your job search!
                    </DialogDescription>
                  </motion.div>
                </DialogHeader>
              </motion.div>
            ) : (
              // Form State
              <motion.div
                key="form"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={containerVariants}
                className="p-6"
              >
                <DialogHeader>
                  <motion.div variants={itemVariants}>
                    <DialogTitle className="text-2xl text-white">
                      Join the Waitlist
                    </DialogTitle>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <DialogDescription className="text-gray-300 text-base">
                      Be among the first to experience AI-powered resume analysis. We'll notify you as soon as we launch.
                    </DialogDescription>
                  </motion.div>
                </DialogHeader>

                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-6 py-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="name" className="text-white text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-slate-800 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500"
                      required
                      disabled={isSubmitting}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="email" className="text-white text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500"
                      required
                      disabled={isSubmitting}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <DialogFooter className="gap-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => onOpenChange(false)}
                          disabled={isSubmitting}
                          className="border-purple-500/30 text-gray-300 hover:bg-purple-500/10 hover:text-white"
                        >
                          Cancel
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50"
                        >
                          {isSubmitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="inline-block"
                              >
                                <Loader className="w-4 h-4 mr-2" />
                              </motion.div>
                              Joining...
                            </>
                          ) : (
                            'Join Waitlist'
                          )}
                        </Button>
                      </motion.div>
                    </DialogFooter>
                  </motion.div>
                </motion.form>
              </motion.div>
            )}
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}

