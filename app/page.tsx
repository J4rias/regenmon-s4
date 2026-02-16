'use client'

import { useState, useEffect } from 'react'
import { Incubator } from '@/components/incubator'
import { Dashboard } from '@/components/dashboard'
import { TopBar } from '@/components/top-bar'
import { MusicProvider } from '@/components/music-provider'
import { StartScreen } from '@/components/start-screen'
import { LoadingScreen } from '@/components/loading-screen'
import type { RegenmonData } from '@/lib/regenmon-types'
import { ARCHETYPES } from '@/lib/regenmon-types'
import { useLanguage } from '@/components/language-provider'
import { usePrivy } from '@privy-io/react-auth'

const STORAGE_KEY = 'regenmon-data'
const THEME_KEY = 'regenmon-theme'

function GameContent() {
  const [regenmon, setRegenmon] = useState<RegenmonData | null>(null)
  const [isDark, setIsDark] = useState(true)
  // Use global language state
  const { locale, toggleLang } = useLanguage()
  const { authenticated } = usePrivy()
  const [mounted, setMounted] = useState(false)

  // New States for Flow
  const [gameState, setGameState] = useState<'START' | 'LOADING' | 'GAME'>('START')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setRegenmon(JSON.parse(saved))
        // setGameState('GAME') // Removed to ensure Start Screen is shown for Login
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

    // Language loading is handled by LanguageProvider

    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authenticated && gameState !== 'START') {
      setGameState('START')
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [mounted, authenticated, gameState])

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

  // Language side effect is handled by LanguageProvider

  function handleHatch(data: RegenmonData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setRegenmon(data)
  }

  function handleUpdate(data: RegenmonData) {
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

  // toggleLang is from context now

  function handleStart() {
    setGameState('LOADING')
  }

  function handleLoaded() {
    setGameState('GAME')
  }

  const currentArchetype = regenmon ? ARCHETYPES.find((a) => a.id === regenmon.type) : null
  const archetypeInfo = currentArchetype
    ? `${currentArchetype.getName(locale)} — "${currentArchetype.getLabel(locale)}"`
    : undefined

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center font-sans">
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading resources...</p>
      </main>
    )
  }

  return (
    <div className="min-h-screen font-sans">
      {gameState === 'START' && (
        <StartScreen
          onStart={handleStart}
          isDark={isDark}
          toggleTheme={toggleTheme}
          locale={locale}
          toggleLang={toggleLang}
        />
      )}

      {gameState === 'LOADING' && (
        <LoadingScreen onLoaded={handleLoaded} locale={locale} />
      )}

      {gameState === 'GAME' && (
        <div className="flex flex-col" style={{ height: '100dvh' }}>
          <TopBar
            isDark={isDark}
            locale={locale}
            onToggleTheme={toggleTheme}
            onToggleLang={toggleLang}
            archetypeInfo={archetypeInfo}
            onReset={regenmon ? handleReset : undefined}
          />
          <main style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            {regenmon ? (
              <Dashboard locale={locale} data={regenmon} onUpdate={handleUpdate} onReset={handleReset} />
            ) : (
              <Incubator locale={locale} onHatch={handleHatch} />
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <MusicProvider>
      <GameContent />
    </MusicProvider>
  )
}
