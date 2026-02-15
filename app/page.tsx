'use client'

import { useState, useEffect } from 'react'
import { Incubator } from '@/components/incubator'
import { Dashboard } from '@/components/dashboard'
import { ThemeToggle } from '@/components/theme-toggle'
import type { RegenmonData } from '@/lib/regenmon-types'

const STORAGE_KEY = 'regenmon-data'
const THEME_KEY = 'regenmon-theme'

export default function Home() {
  const [regenmon, setRegenmon] = useState<RegenmonData | null>(null)
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Load saved data and theme on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setRegenmon(JSON.parse(saved))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    const savedTheme = localStorage.getItem(THEME_KEY)
    if (savedTheme === 'light') {
      setIsDark(false)
    } else {
      setIsDark(true)
    }

    setMounted(true)
  }, [])

  // Apply dark class to html
  useEffect(() => {
    if (!mounted) return
    const html = document.documentElement
    if (isDark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
  }, [isDark, mounted])

  function handleHatch(data: RegenmonData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setRegenmon(data)
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY)
    setRegenmon(null)
  }

  function toggleTheme() {
    setIsDark((prev) => !prev)
  }

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center font-sans">
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Cargando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen font-sans">
      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      {regenmon ? (
        <Dashboard data={regenmon} onReset={handleReset} />
      ) : (
        <Incubator onHatch={handleHatch} />
      )}
    </main>
  )
}
