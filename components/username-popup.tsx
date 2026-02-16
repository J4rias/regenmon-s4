'use client'

import { useState } from 'react'
import { type Locale, t } from '@/lib/i18n'

interface UserNamePopupProps {
    locale: Locale
    onSave: (name: string) => void
    onSkip: () => void
}

export function UserNamePopup({ locale, onSave, onSkip }: UserNamePopupProps) {
    const [name, setName] = useState('')
    const s = t(locale)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onSave(name.trim())
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
            <div
                className="nes-container is-rounded is-dark w-full max-w-md"
                style={{ backgroundColor: '#212529', color: '#fff' }}
            >
                <p className="title">{s.userNameTitle}</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="nes-field">
                        <input
                            type="text"
                            className="nes-input is-dark"
                            placeholder={s.userNamePlaceholder}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="nes-btn is-primary flex-1">
                            {s.userNameSubmit}
                        </button>
                        <button type="button" className="nes-btn flex-1" onClick={onSkip}>
                            {s.userNameSkip}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
