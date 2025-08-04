'use client'

import { useEffect } from 'react'

interface ClientLayoutProps {
  children: React.ReactNode
  fontClasses: string
}

export function ClientLayout({ children, fontClasses }: ClientLayoutProps) {
  useEffect(() => {
    // Apply font classes on client side to avoid hydration issues
    if (typeof document !== 'undefined') {
      document.documentElement.className = fontClasses
    }
  }, [fontClasses])

  return <>{children}</>
}