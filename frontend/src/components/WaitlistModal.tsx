import { useState, useEffect } from 'react'
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
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30">
        {submitSuccess ? (
          // Success State
          <div className="py-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl text-white text-center mb-2">
                You're on the list! 🎉
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-center text-base">
                We'll notify you when ResAlign AI launches. Get ready to transform your job search!
              </DialogDescription>
            </DialogHeader>
          </div>
        ) : (
          // Form State
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">
                Join the Waitlist
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-base">
                Be among the first to experience AI-powered resume analysis. We'll notify you as soon as we launch.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-2">
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
              </div>

              <div className="space-y-2">
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
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="border-purple-500/30 text-gray-300 hover:bg-purple-500/10 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Waitlist'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

