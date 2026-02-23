'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/i18n'

export function LoadingScreen({ onLoaded, locale, isReady = false }: { onLoaded: () => void, locale: Locale, isReady?: boolean }) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const totalTime = 3000 // 3 seconds base
        const intervalTime = 50
        const baseSteps = totalTime / intervalTime

        const timer = setInterval(() => {
            setProgress((prev) => {
                // If data is ready, we jump or move much faster
                const increment = isReady ? (100 / (500 / intervalTime)) : (100 / baseSteps)
                const next = prev + increment

                if (next >= 100) {
                    clearInterval(timer)
                    setTimeout(onLoaded, 100)
                    return 100
                }
                return next
            })
        }, intervalTime)

        return () => clearInterval(timer)
    }, [onLoaded, isReady])

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black font-sans text-white">
            <div className="w-80 space-y-8 text-center px-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-widest animate-pulse blink-text">
                    {locale === 'en' ? 'LOADING...' : 'CARGANDO...'}
                </h2>

                {/* Progress Bar Container */}
                <div className="w-full h-6 sm:h-8 border-4 border-white p-1 relative">
                    <div
                        className="h-full bg-green-500 transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className="text-xs text-gray-400 mt-2 font-mono">
                    {Math.floor(progress)}%
                </p>
            </div>

            <style jsx>{`
        .blink-text {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
        </div>
    )
}
