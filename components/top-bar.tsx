'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, LogOut, Menu, X } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import type { Locale } from '@/lib/i18n'
import type { RegenmonData } from '@/lib/regenmon-types'
import { t } from '@/lib/i18n'
import { RegenmonTheme } from '@/components/regenmon-theme'
import { CeldaIcon } from '@/components/celda-icon'

interface TopBarProps {
  isDark: boolean
  locale: Locale
  onToggleTheme: () => void
  onToggleLang: () => void
  archetypeInfo?: string
  onReset?: () => void
  regenmonData?: any
  playerName?: string
}

export function TopBar({
  isDark,
  locale,
  onToggleTheme,
  onToggleLang,
  archetypeInfo,
  onReset,
  regenmonData,
  playerName
}: TopBarProps) {
  const s = t(locale)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user, logout } = usePrivy()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const displayName = playerName || user?.email?.address || user?.wallet?.address || 'User'
  const shortName = displayName.length > 10 ? `${displayName.slice(0, 4)}...${displayName.slice(-4)}` : displayName

  return (
    <>
      <style>{`
        .topbar-header .nes-btn { margin: 0 !important; }
        .topbar-header p { margin: 0 !important; }
      `}</style>

      <header
        className="topbar-header sticky top-0 z-40 border-b-2 border-border"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          padding: '8px 12px',
          gap: '8px',
          backgroundColor: 'var(--card)',
          minHeight: '50px',
          position: 'relative',
        }}
      >
        {/* Mobile Menu Button - Only visible on mobile */}
        {isMobile && (
          <button
            type="button"
            className="nes-btn flex"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{ fontSize: '10px', width: '40px', height: '35px', padding: 0, alignItems: 'center', justifyContent: 'center', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        {/* Desktop Left: Toggles and Theme */}
        <div className="hidden sm:flex flex-row items-center gap-2 flex-1 justify-start">
          <button
            type="button"
            onClick={onToggleLang}
            className="nes-btn"
            style={{ fontSize: '10px', width: '40px', height: '35px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {locale === 'en' ? 'ES' : 'EN'}
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className="nes-btn"
            style={{ fontSize: '10px', width: '40px', height: '35px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          <RegenmonTheme />
        </div>

        {/* Center: Archetype Info - Shown on tablet and larger (md+) */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 w-auto max-w-[30%] lg:max-w-[40%] px-4 pointer-events-none">
          {archetypeInfo && (
            <p
              className="font-bold text-[10px] lg:text-[12px] text-center whitespace-nowrap overflow-hidden text-ellipsis uppercase m-0 pointer-events-auto"
              style={{ color: 'var(--foreground)' }}
            >
              {archetypeInfo}
            </p>
          )}
        </div>

        {/* Right: User Name, Coins, and Logout */}
        <div className="flex flex-row items-center justify-end gap-2 flex-1 min-w-0">
          {/* Coin Display */}
          {regenmonData && (
            <div
              className={`flex items-center gap-2 px-2 py-1 rounded border text-[10px] sm:text-xs shrink-0`}
              style={{
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(200, 200, 200, 0.5)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              }}
              title={s.coinsTooltip}
            >
              <CeldaIcon className="w-3 h-3" />
              <span
                className="font-bold"
                style={{ color: isDark ? '#fbbf24' : '#b45309' }}
              >
                {regenmonData.coins ?? 0}
              </span>
            </div>
          )}

          {/* User Name - Always visible */}
          <div className="flex items-center gap-2 px-2 py-1 border-2 border-dashed border-gray-500 rounded text-[10px] sm:text-[11px] h-[35px] shrink-0" style={{ color: 'var(--foreground)' }}>
            <span title={displayName} className="whitespace-nowrap">{shortName}</span>
          </div>

          {/* Reset Button - Hidden on mobile, visible on sm and larger */}
          {onReset && !isMobile && (
            <button
              type="button"
              className="nes-btn is-error shrink-0"
              onClick={() => setShowConfirm(true)}
              style={{ fontSize: '10px' }}
            >
              {s.resetButton}
            </button>
          )}

          {/* Logout Button - Always visible */}
          <button
            type="button"
            className="nes-btn is-warning shrink-0"
            onClick={logout}
            style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 6px' }}
            title={s.logoutButton}
          >
            <LogOut size={12} />
            <span className="hidden xl:inline">{s.logoutButton}</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      {isMobile && showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          style={{ top: '50px' }}
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Mobile Menu - Only shown on mobile */}
      {isMobile && showMobileMenu && (
        <div
          className="fixed z-50 border-r-2 border-border shadow-lg"
          style={{
            top: '50px',
            left: '0',
            bottom: '0',
            width: '75%',
            maxWidth: '320px',
            backgroundColor: 'var(--card)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '4px 0 12px rgba(0, 0, 0, 0.3)',
            overflowY: 'auto',
          }}
        >
          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => {
              onToggleLang()
              setShowMobileMenu(false)
            }}
            className="nes-btn w-full"
            style={{ fontSize: '12px', textAlign: 'left' }}
          >
            {locale === 'en' ? '🇪🇸 Español' : '🇬🇧 English'}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => {
              onToggleTheme()
              setShowMobileMenu(false)
            }}
            className="nes-btn w-full"
            style={{ fontSize: '12px', textAlign: 'left' }}
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          {/* Archetype Info - Only shown in mobile menu */}
          {archetypeInfo && (
            <div
              className="md:hidden nes-container w-full"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                fontSize: '12px',
                padding: '8px',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>
                {archetypeInfo}
              </p>
            </div>
          )}

          {/* Reset Button */}
          {onReset && (
            <button
              type="button"
              className="nes-btn is-error w-full"
              onClick={() => {
                setShowConfirm(true)
                setShowMobileMenu(false)
              }}
              style={{ fontSize: '12px' }}
            >
              {s.resetButton}
            </button>
          )}

          {/* Theme Component */}
          <div style={{ paddingTop: '8px' }}>
            <RegenmonTheme />
          </div>
        </div>
      )}

      {/* Confirm Reset Dialog */}
      {showConfirm && onReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div
            className="nes-container is-rounded w-full max-w-md"
            style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
          >
            <p className="mb-6 text-center text-xs leading-relaxed sm:text-sm" style={{ color: 'var(--foreground)' }}>
              {s.confirmReset}
            </p>
            <div className="flex justify-center gap-4">
              <button type="button" className="nes-btn is-error" onClick={() => { setShowConfirm(false); onReset() }} style={{ fontSize: '12px' }}>
                {s.yes}
              </button>
              <button type="button" className="nes-btn" onClick={() => setShowConfirm(false)} style={{ fontSize: '12px' }}>
                {s.no}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
