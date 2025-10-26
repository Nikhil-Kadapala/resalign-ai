"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import  { Toaster as Sonner } from "sonner"
import type { ToasterProps } from "sonner"
import { useEffect } from "react"

const Toaster = ({ ...props }: ToasterProps) => {
  useEffect(() => {
    // Inject critical CSS to override Sonner styles
    const style = document.createElement('style')
    style.textContent = `
      .sonner-toast.sonner-success {
        background: #22c55e !important;
        color: #ffffff !important;
        border: 2px solid #16a34a !important;
      }
      .sonner-toast.sonner-success svg {
        color: #ffffff !important;
      }
      
      .sonner-toast.sonner-error {
        background: #ef4444 !important;
        color: #ffffff !important;
        border: 2px solid #dc2626 !important;
      }
      .sonner-toast.sonner-error svg {
        color: #ffffff !important;
      }
      
      .sonner-toast.sonner-warning {
        background: #facc15 !important;
        color: #000000 !important;
        border: 2px solid #f59e0b !important;
      }
      .sonner-toast.sonner-warning svg {
        color: #000000 !important;
      }
      
      .sonner-toast.sonner-info {
        background: #3b82f6 !important;
        color: #ffffff !important;
        border: 2px solid #1d4ed8 !important;
      }
      .sonner-toast.sonner-info svg {
        color: #ffffff !important;
      }
      
      .sonner-toast.sonner-loading {
        background: #3b82f6 !important;
        color: #ffffff !important;
        border: 2px solid #1d4ed8 !important;
      }
      .sonner-toast.sonner-loading svg {
        color: #ffffff !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <Sonner
      position="top-center"
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
