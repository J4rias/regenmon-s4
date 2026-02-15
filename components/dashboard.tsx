'use client'

import { useState } from 'react'
import { ARCHETYPES, type RegenmonData } from '@/lib/regenmon-types'

interface DashboardProps {
  data: RegenmonData
  onReset: () => void
}

export function Dashboard({ data, onReset }: DashboardProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const archetype = ARCHETYPES.find((a) => a.id === data.type)!

  function handleReset() {
    setShowConfirm(true)
  }

  function confirmReset() {
    setShowConfirm(false)
    onReset()
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-sm sm:text-base" style={{ color: 'var(--foreground)' }}>
          Regenmon
        </h1>
        <button
          type="button"
          className="nes-btn is-error"
          onClick={handleReset}
          style={{ fontSize: '10px' }}
        >
          Reiniciar
        </button>
      </div>

      {/* Display area */}
      <div
        className="nes-container is-rounded scanlines relative mb-6 w-full max-w-2xl overflow-hidden"
        style={{
          backgroundColor: archetype.colorDark,
          borderColor: archetype.color,
          color: 'var(--foreground)',
        }}
      >
        <div className="flex flex-col items-center gap-4 py-6">
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {archetype.name} - {`"${archetype.label}"`}
          </p>
          <p className="text-center text-sm sm:text-lg" style={{ color: archetype.color }}>
            {data.name}
          </p>

          {/* Placeholder object simulating character position and effects */}
          <div className="animate-breathe flex flex-col items-center gap-2">
            {/* Main body - pixelated placeholder */}
            <div
              className="relative flex h-24 w-24 items-center justify-center sm:h-32 sm:w-32"
              style={{
                imageRendering: 'pixelated',
              }}
            >
              {/* Outer shell */}
              <div
                className="absolute inset-0 border-4"
                style={{
                  borderColor: archetype.color,
                  backgroundColor: archetype.colorDark,
                }}
              />
              {/* Inner core */}
              <div
                className="relative z-10 h-10 w-10 sm:h-14 sm:w-14"
                style={{
                  backgroundColor: archetype.color,
                  boxShadow: `0 0 20px ${archetype.color}80, 0 0 40px ${archetype.color}40`,
                }}
              />
              {/* Eye detail */}
              <div
                className="absolute top-3 left-3 z-20 h-3 w-3 sm:h-4 sm:w-4"
                style={{ backgroundColor: 'var(--foreground)' }}
              />
              <div
                className="absolute top-3 right-3 z-20 h-3 w-3 sm:h-4 sm:w-4"
                style={{ backgroundColor: 'var(--foreground)' }}
              />
            </div>

            {/* Shadow */}
            <div
              className="h-2 w-16 animate-float opacity-30 sm:w-20"
              style={{
                backgroundColor: archetype.color,
                filter: 'blur(4px)',
              }}
            />
          </div>

          {/* Particles effect */}
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-float h-2 w-2"
                style={{
                  backgroundColor: archetype.color,
                  animationDelay: `${i * 0.5}s`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats panel */}
      <div
        className="nes-container is-rounded w-full max-w-2xl"
        style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
      >
        <h2 className="mb-4 text-center text-xs" style={{ color: 'var(--foreground)' }}>
          Estadisticas
        </h2>

        <div className="flex flex-col gap-5">
          {/* Happiness */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-xs" style={{ color: 'var(--foreground)' }}>
              <span>Felicidad</span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {data.stats.happiness}/100
              </span>
            </label>
            <progress
              className="nes-progress is-success"
              value={data.stats.happiness}
              max={100}
            />
          </div>

          {/* Energy */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-xs" style={{ color: 'var(--foreground)' }}>
              <span>Energia</span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {data.stats.energy}/100
              </span>
            </label>
            <progress
              className="nes-progress is-warning"
              value={data.stats.energy}
              max={100}
            />
          </div>

          {/* Hunger */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-xs" style={{ color: 'var(--foreground)' }}>
              <span>Saciedad</span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {data.stats.hunger}/100
              </span>
            </label>
            <progress
              className="nes-progress is-error"
              value={data.stats.hunger}
              max={100}
            />
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div
            className="nes-container is-rounded w-full max-w-md"
            style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
          >
            <p className="mb-6 text-center text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
              Seguro que quieres abandonar a tu Regenmon?
            </p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                className="nes-btn is-error"
                onClick={confirmReset}
              >
                Si
              </button>
              <button
                type="button"
                className="nes-btn"
                onClick={() => setShowConfirm(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
