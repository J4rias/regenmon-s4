'use client'

import React, { useState } from 'react'
import * as Tone from 'tone'
import { type Locale, t } from '@/lib/i18n'
import { CeldaIcon } from '@/components/celda-icon'

// Definimos las props para que el componente padre pueda recibir las monedas
interface Props {
    locale: Locale
    onClaim: (amount: number) => void; // Función que ejecutaremos al reclamar
}

const REWARD_AMOUNT = 30; // Cantidad de Celdas a dar (User requested 30)

export const DailyRewardChest: React.FC<Props> = ({ locale, onClaim }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClaimable, setIsClaimable] = useState(true); // Simula si está disponible hoy
    const [showFloatingText, setShowFloatingText] = useState(false);
    const s = t(locale)

    // --- SFX: Sonido de "Power Up" 8-bits ---
    const playRewardSfx = async () => {
        // Asegurar que el contexto de audio inicie (requisito del navegador)
        await Tone.start();

        // Crear un sintetizador simple de onda cuadrada (sonido NES)
        const synth = new Tone.Synth({
            oscillator: { type: 'square' },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 }
        }).toDestination();
        synth.volume.value = -5; // Bajar volumen un poco

        const now = Tone.now();
        // Tocar un arpegio rápido ascendente (C5 -> E5 -> G5)
        synth.triggerAttackRelease("C5", "16n", now);
        synth.triggerAttackRelease("E5", "16n", now + 0.1);
        synth.triggerAttackRelease("G5", "8n", now + 0.2);
    };
    // ----------------------------------------

    const handleClaimClick = () => {
        if (!isClaimable || isOpen) return; // Evitar doble clic

        // 1. Cambiar estado visual
        setIsOpen(true);
        setIsClaimable(false);
        setShowFloatingText(true);

        // 2. Reproducir sonido
        playRewardSfx();

        // 3. Esperar a que termine la animación antes de actualizar el estado del padre (que cerrará el modal)
        setTimeout(() => {
            onClaim(REWARD_AMOUNT);
        }, 2000);

        // 4. Ocultar el texto flotante después de 2 segundos
        setTimeout(() => {
            setShowFloatingText(false);
        }, 2000);
    };

    return (
        // Contenedor estilo NES (Modal overlay)
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
            <div className="nes-container is-dark with-title flex flex-col items-center p-4 relative w-full max-w-sm" style={{ backgroundColor: '#212529' }}>
                <p className="title">{s.rewardTitle}</p>

                <div className="relative mb-8 mt-4">
                    {/* Aquí ocurre la "animación":
            Simplemente cambiamos el 'src' de la imagen según el estado 'isOpen'.
            El pixel art funciona mejor con cambios bruscos (snappy) que con transiciones suaves.
            */}
                    {/* Using Next.js Image or standard img tag? Standard img is easier for simple switch if not optimizing heavily yet or if in public. using public paths */}
                    <img
                        src={isOpen ? "/images/chest-open.png" : "/images/chest-closed.png"}
                        alt="Cofre de Recompensa"
                        width={128}
                        height={128}
                        style={{
                            imageRendering: 'pixelated',
                        }}
                    />

                    {/* Texto Flotante animado (+30 ⚡) */}
                    {showFloatingText && (
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-yellow-300 font-bold text-xl animate-bounce flex items-center gap-2 whitespace-nowrap"
                            style={{
                                textShadow: '3px 3px 0px #000', // Sombra dura estilo retro
                                animationDuration: '1s'
                            }}
                        >
                            +{REWARD_AMOUNT} <CeldaIcon className="w-5 h-7" />
                        </div>
                    )}
                </div>

                {/* Botón estilo NES */}
                <button
                    type="button"
                    className={`nes-btn ${isClaimable ? 'is-warning' : 'is-disabled'}`}
                    onClick={handleClaimClick}
                    disabled={!isClaimable}
                >
                    {isOpen ? s.rewardClaimed : s.rewardButton}
                </button>
            </div>
        </div>
    );
};
