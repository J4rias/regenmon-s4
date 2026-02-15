'use client'

import { Sun, Moon } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'

interface TopBarProps {
  isDark: boolean
  locale: Locale
  onToggleTheme: () => void
  onToggleLang: () => void
}

export function TopBar({ isDark, locale, onToggleTheme, onToggleLang }: TopBarProps) {
  const s = t(locale)

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-end border-b-2 border-border px-3 py-1.5 sm:px-5"
      style={{ backgroundColor: 'var(--card)' }}
    >
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button
          type="button"
          onClick={onToggleLang}
          className="nes-btn btn-press"
          style={{ fontSize: '9px', padding: '3px 10px' }}
          aria-label={locale === 'en' ? 'Cambiar a Espanol' : 'Switch to English'}
        >
          {locale === 'en' ? 'ES' : 'EN'}
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="nes-btn btn-press flex items-center"
          style={{ fontSize: '9px', padding: '3px 8px' }}
          aria-label={isDark ? s.lightTheme : s.darkTheme}
        >
          {isDark ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </header>
  )
}
