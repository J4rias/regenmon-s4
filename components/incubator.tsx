'use client'

import { useState } from 'react'
import { ARCHETYPES, type ArchetypeId, type RegenmonData } from '@/lib/regenmon-types'

interface IncubatorProps {
  onHatch: (data: RegenmonData) => void
}

export function Incubator({ onHatch }: IncubatorProps) {
  const [name, setName] = useState('')
  const [selectedType, setSelectedType] = useState<ArchetypeId | null>(null)

  const isValid = name.trim().length >= 2 && name.trim().length <= 15 && selectedType !== null

  function handleHatch() {
    if (!isValid || !selectedType) return
    const data: RegenmonData = {
      name: name.trim(),
      type: selectedType,
      stats: { happiness: 50, energy: 50, hunger: 50 },
      createdAt: new Date().toISOString(),
    }
    onHatch(data)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="nes-container is-rounded w-full max-w-2xl" style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}>
        <h1 className="mb-6 text-center text-base sm:text-lg" style={{ color: 'var(--foreground)' }}>
          Crea tu Regenmon
        </h1>

        {/* Name input */}
        <div className="mb-6">
          <label htmlFor="regenmon-name" className="mb-2 block text-xs" style={{ color: 'var(--foreground)' }}>
            Nombre (2-15 caracteres):
          </label>
          <input
            id="regenmon-name"
            type="text"
            className="nes-input"
            placeholder="Escribe un nombre..."
            value={name}
            maxLength={15}
            onChange={(e) => setName(e.target.value)}
            style={{ backgroundColor: 'var(--secondary)', color: 'var(--foreground)' }}
          />
          {name.length > 0 && name.trim().length < 2 && (
            <p className="mt-1 text-xs" style={{ color: '#cd5c5c' }}>
              Minimo 2 caracteres
            </p>
          )}
        </div>

        {/* Archetype selection */}
        <div className="mb-6">
          <p className="mb-3 text-xs" style={{ color: 'var(--foreground)' }}>Selecciona un Arquetipo:</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {ARCHETYPES.map((arch) => {
              const isSelected = selectedType === arch.id
              return (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => setSelectedType(arch.id)}
                  className="nes-container is-rounded cursor-pointer text-left transition-all"
                  style={{
                    borderColor: isSelected ? arch.color : 'var(--border)',
                    backgroundColor: isSelected ? arch.colorDark : 'var(--secondary)',
                    color: 'var(--foreground)',
                    boxShadow: isSelected ? `0 0 12px ${arch.color}40` : 'none',
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    {/* Placeholder object instead of character */}
                    <div
                      className="flex h-16 w-16 items-center justify-center border-4"
                      style={{
                        borderColor: arch.color,
                        backgroundColor: arch.colorDark,
                        imageRendering: 'pixelated',
                      }}
                    >
                      <div
                        className="h-6 w-6"
                        style={{ backgroundColor: arch.color }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{ color: arch.color }}>
                      {arch.name}
                    </span>
                    <span className="text-center text-xs" style={{ color: 'var(--muted-foreground)', fontSize: '8px', lineHeight: '1.4' }}>
                      {`"${arch.label}"`}
                    </span>
                    <span className="text-center text-xs" style={{ color: 'var(--muted-foreground)', fontSize: '7px', lineHeight: '1.4' }}>
                      {arch.description}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Hatch button */}
        <div className="flex justify-center">
          <button
            type="button"
            className={`nes-btn ${isValid ? 'is-primary' : 'is-disabled'}`}
            disabled={!isValid}
            onClick={handleHatch}
          >
            Eclosionar!
          </button>
        </div>
      </div>
    </div>
  )
}
