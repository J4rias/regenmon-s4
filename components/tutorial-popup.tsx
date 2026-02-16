'use client'

import { type Locale, t } from '@/lib/i18n'
import { CeldaIcon } from '@/components/celda-icon'

interface TutorialPopupProps {
    locale: Locale
    onClose: () => void
}

export function TutorialPopup({ locale, onClose }: TutorialPopupProps) {
    const s = t(locale)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
            <div
                className="nes-container is-rounded is-dark w-full max-w-sm"
                style={{ backgroundColor: '#212529', color: '#fff' }}
            >
                <p className="title" style={{ color: '#f7d51d' }}>{s.tutorialTitle}</p>
                <div className="flex flex-col gap-4 text-sm mb-6">
                    <p>
                        {s.tutorialText}
                    </p>
                    <div className="flex items-center justify-center gap-2 p-2 bg-white/10 rounded">
                        <span>+100 </span>
                        <CeldaIcon className="w-5 h-7" />
                        <span> {s.cellName}</span>
                    </div>
                </div>
                <button type="button" className="nes-btn is-success w-full" onClick={onClose}>
                    {s.tutorialButton}
                </button>
            </div>
        </div>
    )
}
