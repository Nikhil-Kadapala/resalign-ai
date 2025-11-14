'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { ModeToggle } from '@/components/mode-toggle'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import logo from '@/assets/logo.png'
interface NavbarProps {
  onWaitlistClick?: () => void
}

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar({ onWaitlistClick }: NavbarProps) {
  const { user } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky z-50 w-full transition-all duration-300 pt-4 px-2 sm:px-4"
      style={{
        top: 0,
      }}
    >
      <motion.div
        animate={{
          width: isScrolled ? '70%' : '100%',
          marginLeft: isScrolled ? 'auto' : 0,
          marginRight: isScrolled ? 'auto' : 0,
          borderRadius: isScrolled ? '2rem' : '0px',
          backgroundColor: isScrolled ? 'var(--zinc-900)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(2px)' : 'blur(0px)',
          paddingTop: isScrolled ? '0.75rem' : '0.50rem',
          paddingBottom: isScrolled ? '0.75rem' : '0.50rem',
          marginBottom: isScrolled ? '0.75rem' : '0px',
          borderColor: isScrolled ? 'var(--border)' : 'transparent',
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="mx-auto px-4 sm:px-6 lg:px-8 border"
      >
        <motion.div
          animate={{
            height: isScrolled ? 56 : 64,
          }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 group">
            <motion.div
              className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                scale: isScrolled ? 0.95 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <img src={logo} alt="ResAlign AI" width={32} height={32} />
            </motion.div>
            <motion.span
              className="hidden sm:inline font-bold text-foreground group-hover:text-primary transition-colors"
              animate={{
                fontSize: isScrolled ? '1rem' : '1.125rem',
                opacity: isScrolled ? 0.9 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              ResAlign AI
            </motion.span>
          </a>

          {/* Navigation Menu */}
          <motion.div
            animate={{
              opacity: isScrolled ? 0.95 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="hidden md:flex"
          >
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    animate={{
                      scale: isScrolled ? 0.95 : 1,
                    }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <a href={item.href} className="text-foreground hover:text-primary transition-colors">
                          {item.label}
                        </a>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </motion.div>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </motion.div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ModeToggle />

            {user ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href="/dashboard">Dashboard</a>
                </Button>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onWaitlistClick}
                className="px-4 sm:px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-sm sm:text-base cursor-pointer"
              >
                Join Waitlist
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.header>
  )
}

