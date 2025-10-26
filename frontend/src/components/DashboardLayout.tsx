import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from './ui/sidebar'
import { House , FileText, LogOut, History } from 'lucide-react'

import logo from '@/assets/logo.png'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
  }

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-purple-600/40 text-purple-200' : ''
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" style={{
        '--sidebar-bg': 'rgb(3, 7, 30)',
        '--sidebar-foreground': 'rgb(226, 232, 240)',
      } as React.CSSProperties}>
        <Sidebar className="border-r border-purple-700/30 bg-slate-950">
        <SidebarHeader className="border-b border-purple-700/30 p-4 bg-gradient-to-r from-purple-950 to-slate-950 via-slate-900">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="logo" className="w-8 h-8" />
            <span className="text-white font-bold text-lg">ResAlign AI</span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4 bg-slate-950">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={`rounded-lg transition-all ${isActive('/dashboard') ? 'bg-purple-600/40 text-purple-200 hover:bg-purple-600/50' : 'text-gray-300 hover:text-white hover:bg-purple-500/10'}`}>
                <Link to="/dashboard" className="flex items-center space-x-3 px-3 py-2">
                  <House  className="w-5 h-5" />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild className={`rounded-lg transition-all ${isActive('/analyses') ? 'bg-purple-600/40 text-purple-200 hover:bg-purple-600/50' : 'text-gray-300 hover:text-white hover:bg-purple-500/10'}`}>
                <Link to="/analyses" className="flex items-center space-x-3 px-3 py-2">
                  <History className="w-5 h-5" />
                  <span>Report History</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild className={`rounded-lg transition-all ${isActive('/library') ? 'bg-purple-600/40 text-purple-200 hover:bg-purple-600/50' : 'text-gray-300 hover:text-white hover:bg-purple-500/10'}`}>
                <Link to="/library" className="flex items-center space-x-3 px-3 py-2">
                  <FileText className="w-5 h-5" />
                  <span>View Files</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <div className="border-t border-purple-700/30 p-2 mt-auto bg-slate-950">
          <div className="flex items-center justify-between mb-4">
            <div
              className="flex items-center space-x-3 flex-1 relative"
            >
              <div
                className="w-10 h-10 rounded-full
                bg-gradient-to-br from-blue-400 to-purple-500
                flex items-center justify-center
                text-white font-semibold flex-shrink-0 text-sm
                cursor-pointer hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                onClick={() => setShowMenu(!showMenu)}
                >
                  { user?.user_metadata?.full_name ? user.user_metadata.full_name.split(' ').map((name: string) => name.charAt(0).toUpperCase()).join('').slice(0, 2) : '' }
              </div>
              {showMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800/95 rounded-lg shadow-lg border border-purple-500/30 py-2 z-10 backdrop-blur-sm">
                      <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors font-medium flex items-center space-x-2"
                      >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                      </button>
                  </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-300 truncate">{user?.email}</p>
              </div>

            </div>
          </div>
        </div>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <div className="flex flex-col flex-1">
          {/* Header with Sidebar Trigger */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-purple-700/30 bg-gradient-to-r from-slate-950 to-slate-900 backdrop-blur-sm px-4">
            <SidebarTrigger className="-ml-1 text-gray-300 hover:text-white" />
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-slate-950">
            {children}
          </main>
        </div>
      </SidebarInset>
    </div>
    </SidebarProvider>
  )
}
