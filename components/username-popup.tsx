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
        const trimmed = name.trim()
        if (trimmed.length >= 2 && trimmed.length <= 15) {
            onSave(trimmed)
        }
    }

    const isValid = name.trim().length >= 2 && name.trim().length <= 15

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
                            className={`nes-input is-dark ${name.length > 0 && !isValid ? 'is-error' : ''}`}
                            placeholder={s.userNamePlaceholder}
                            value={name}
                            maxLength={15}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px]" style={{ color: '#cd5c5c' }}>
                                {name.length > 0 && name.length < 2 && s.nameMinError}
                            </span>
                            <span className="text-[10px] text-gray-500">{name.length}/15</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className={`nes-btn is-primary flex-1 ${!isValid ? 'is-disabled' : ''}`}
                            disabled={!isValid}
                        >
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
