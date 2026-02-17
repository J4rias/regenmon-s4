'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import * as Tone from 'tone'

const MUSIC_KEY = 'regenmon-music'

type MusicContextType = {
    isPlaying: boolean
    toggleMusic: () => void
    startMusic: () => Promise<void>
}

const MusicContext = createContext<MusicContextType | null>(null)

export function MusicProvider({ children }: { children: React.ReactNode }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const synthRef = useRef<Tone.PolySynth | null>(null)
    const partRef = useRef<Tone.Part | null>(null)
    const loopRef = useRef<Tone.Loop | null>(null)
    const startedRef = useRef(false)
    const initializedRef = useRef(false)

    const startMusic = useCallback(async () => {
        if (startedRef.current) return
        startedRef.current = true

        try {
            await Tone.start()

            // Main synth
            const synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'square' },
                envelope: {
                    attack: 0.02,
                    decay: 0.2,
                    sustain: 0.3,
                    release: 1.5,
                },
            }).toDestination()

            synth.volume.value = -10
            synthRef.current = synth

            // Melodía más larga y misteriosa para atmósfera post-apocalíptica
            const melody = [
                // Compás 1: Cm (C - Eb - G)
                { time: '0:0:0', note: ['C4', 'G4'] },
                { time: '0:0:2', note: ['Eb4', 'C5'] },
                { time: '0:1:0', note: ['G4', 'Eb5'] },
                { time: '0:1:2', note: ['C4', 'G4'] },

                // Compás 2: Ab (Ab - C - Eb)
                { time: '0:2:0', note: ['Ab3', 'Eb4'] },
                { time: '0:2:2', note: ['C4', 'Ab4'] },
                { time: '0:3:0', note: ['Eb4', 'C5'] },
                { time: '0:3:2', note: ['Ab3', 'Eb4'] },

                // Compás 3: Bb (Bb - D - F)
                { time: '1:0:0', note: ['Bb3', 'F4'] },
                { time: '1:0:2', note: ['D4', 'Bb4'] },
                { time: '1:1:0', note: ['F4', 'D5'] },
                { time: '1:1:2', note: ['Bb3', 'F4'] },

                // Compás 4: G (G - B - D) - tensión
                { time: '1:2:0', note: ['G3', 'D4'] },
                { time: '1:2:2', note: ['B3', 'G4'] },
                { time: '1:3:0', note: ['D4', 'B4'] },
                { time: '1:3:2', note: ['G3', 'D4'] },

                // Compás 5: Fm (F - Ab - C)
                { time: '2:0:0', note: ['F3', 'C4'] },
                { time: '2:0:2', note: ['Ab3', 'F4'] },
                { time: '2:1:0', note: ['C4', 'Ab4'] },
                { time: '2:1:2', note: ['F4', 'C5'] },

                // Compás 6: Db (Db - F - Ab)
                { time: '2:2:0', note: ['Db4', 'Ab4'] },
                { time: '2:2:2', note: ['F4', 'Db5'] },
                { time: '2:3:0', note: ['Ab4', 'F5'] },
                { time: '2:3:2', note: ['Db4', 'Ab4'] },

                // Compás 7: Eb (Eb - G - Bb)
                { time: '3:0:0', note: ['Eb4', 'Bb4'] },
                { time: '3:0:2', note: ['G4', 'Eb5'] },
                { time: '3:1:0', note: ['Bb4', 'G5'] },
                { time: '3:1:2', note: ['Eb4', 'Bb4'] },

                // Compás 8: G (G - B - D) - resolución misteriosa
                { time: '3:2:0', note: ['G3', 'D4'] },
                { time: '3:2:2', note: ['B3', 'G4'] },
                { time: '3:3:0', note: ['D4', 'B4'] },
                { time: '3:3:2', note: ['G4', 'D5'] },
            ]

            const part = new Tone.Part((time, value) => {
                synthRef.current?.triggerAttackRelease(value.note, '8n', time)
            }, melody).start(0)

            part.loop = true
            part.loopEnd = '4m'
            partRef.current = part

            // Ambient random notes
            const scale = ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5']
            const ambientSynth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'square' },
                envelope: {
                    attack: 0.01,
                    decay: 0.05,
                    sustain: 0.05,
                    release: 0.5,
                },
            }).toDestination()
            ambientSynth.volume.value = -22

            const loop = new Tone.Loop((time) => {
                const randomNote = scale[Math.floor(Math.random() * scale.length)]
                ambientSynth.triggerAttackRelease(randomNote, '16n', time)
            }, '8n').start(0)

            loopRef.current = loop

            Tone.getTransport().bpm.value = 100
            Tone.getTransport().start()

            setIsPlaying(true)
        } catch {
            startedRef.current = false
        }
    }, [])

    const stopMusic = useCallback(() => {
        Tone.getTransport().stop()
        Tone.getTransport().cancel()

        // Dispose but keep references ready to re-init if needed
        // Actually, in ToneJS it's often better to just stop transport if we plan to resume
        // But for full cleanup:
        /*
        partRef.current?.dispose()
        partRef.current = null
        loopRef.current?.dispose()
        loopRef.current = null
        synthRef.current?.dispose()
        synthRef.current = null
        startedRef.current = false
        */

        // Simple stop for toggle
        setIsPlaying(false)
    }, [])

    // Real stop/dispose logic
    const disposeAudio = useCallback(() => {
        if (startedRef.current) {
            try {
                Tone.getTransport().stop()
                Tone.getTransport().cancel()
                partRef.current?.dispose()
                loopRef.current?.dispose()
                synthRef.current?.dispose()
                startedRef.current = false
            } catch (e) {
                console.error(e)
            }
        }
    }, [])

    const toggleMusic = useCallback(() => {
        if (isPlaying) {
            disposeAudio() // Fully stop to save resources
            setIsPlaying(false)
            localStorage.setItem(MUSIC_KEY, 'off')
        } else {
            localStorage.setItem(MUSIC_KEY, 'on')
            startMusic()
        }
    }, [isPlaying, startMusic, disposeAudio])

    // Initial load
    useEffect(() => {
        if (initializedRef.current) return
        initializedRef.current = true

        const savedPref = localStorage.getItem(MUSIC_KEY)
        if (savedPref === 'on') {
            // Auto-start attempt
            startMusic().catch(() => {
                // Autoplay blocked, wait for interaction
                setIsPlaying(false)
            })
        } else {
            setIsPlaying(false)
        }

        // Interactions to unlock audio
        const handleInteraction = () => {
            if (localStorage.getItem(MUSIC_KEY) === 'on' && !startedRef.current) {
                startMusic()
            }
            document.removeEventListener('click', handleInteraction)
            document.removeEventListener('touchstart', handleInteraction)
            document.removeEventListener('keydown', handleInteraction)
        }

        document.addEventListener('click', handleInteraction)
        document.addEventListener('touchstart', handleInteraction)
        document.addEventListener('keydown', handleInteraction)

        return () => {
            document.removeEventListener('click', handleInteraction)
            document.removeEventListener('touchstart', handleInteraction)
            document.removeEventListener('keydown', handleInteraction)
        }
    }, [startMusic])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disposeAudio()
        }
    }, [disposeAudio])

    return (
        <MusicContext.Provider value={{ isPlaying, toggleMusic, startMusic }}>
            {children}
        </MusicContext.Provider>
    )
}

export function useMusic() {
    const context = useContext(MusicContext)
    if (!context) {
        throw new Error('useMusic must be used within a MusicProvider')
    }
    return context
}
