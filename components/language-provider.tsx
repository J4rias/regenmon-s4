'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { LANG_KEY, Locale } from '@/lib/i18n'

interface LanguageContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState<Locale>('en')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const savedLang = localStorage.getItem(LANG_KEY)
        if (savedLang === 'es') {
            setLocale('es')
        } else {
            setLocale('en')
        }
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return
        document.documentElement.lang = locale
        localStorage.setItem(LANG_KEY, locale)
    }, [locale, mounted])

    const toggleLang = () => {
        setLocale((prev) => (prev === 'en' ? 'es' : 'en'))
    }

    // Prevent hydration mismatch by rendering nothing or default until mounted?
    // Or just render children. Since locale affects text, it might cause hydration mismatch if server renders 'en' and client switches to 'es'.
    // But Next.js app router usually renders static parts.
    // For now, let's return children. If specific flickering issues occur, we can handle them.

    return (
        <LanguageContext.Provider value={{ locale, setLocale, toggleLang }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
