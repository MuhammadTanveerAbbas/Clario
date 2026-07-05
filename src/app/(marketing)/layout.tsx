'use client'

import { useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { MktNav } from '@/components/marketing/MktNav'
import { MktFooter } from '@/components/marketing/MktFooter'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MktNav />
      <main className="flex-1">{children}</main>
      <MktFooter />
    </div>
  )
}
