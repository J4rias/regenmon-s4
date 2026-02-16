'use client'

import { useMusic } from '@/components/music-provider'

export function RegenmonTheme() {
  const { isPlaying, toggleMusic } = useMusic()

  return (
    <button
      type="button"
      onClick={toggleMusic}
      className="nes-btn btn-press"
      style={{ fontSize: '10px', margin: 0, width: '40px', height: '35px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      aria-label={isPlaying ? 'Stop music' : 'Play music'}
    >
      {isPlaying ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
      )}
    </button>
  )
}
