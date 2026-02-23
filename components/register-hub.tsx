import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useHub } from '@/app/hooks/useHub';
import { useRouter } from 'next/navigation';
import { ActivityFeed } from './activity-feed';
import type { RegenmonData, EvolutionStage } from '@/lib/regenmon-types';
import { SPRITE_MAP, EVOLUTION_STAGES } from '@/lib/regenmon-types';

export function getSpriteUrl(emoji: string) {
    const codePoints = [...emoji].map(c => c.codePointAt(0)?.toString(16)).join('-');
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${codePoints}.png`;
}

interface RegisterHubProps {
    data: RegenmonData;
    playerName: string;
}

export function RegisterHub({ data, playerName }: RegisterHubProps) {
    const [isRegistered, setIsRegistered] = useState(false);
    const [hubId, setHubId] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { register, isLoading } = useHub();
    const router = useRouter();

    useEffect(() => {
        const savedHubId = localStorage.getItem('hubRegenmonId');
        const savedIsRegistered = localStorage.getItem('isRegisteredInHub') === 'true';

        if (savedIsRegistered && savedHubId) {
            setIsRegistered(true);
            setHubId(savedHubId);
        }
    }, []);

    const stageNum = data.evolutionStage || 1;
    const stageIndex = Math.max(0, Math.min(EVOLUTION_STAGES.length - 1, stageNum - 1));
    const stage = EVOLUTION_STAGES[stageIndex];
    const sprites = SPRITE_MAP[data.type as keyof typeof SPRITE_MAP] || SPRITE_MAP['Scrap-Eye'];
    const currentSprite = (sprites[stage] && sprites[stage].happy) ? sprites[stage].happy : sprites.baby.happy;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Specific canonical URL provided by user
        const appUrl = 'https://v0-regenmon-s5.vercel.app/';
        // Use the same base for the sprite so it's accessible globally
        const spriteUrl = appUrl.replace(/\/$/, '') + currentSprite;

        const coinsValue = typeof data.coins === 'number' ? data.coins : Number(data.coins) || 0;

        try {
            const response = await register({
                name: data.name,
                ownerName: playerName || 'Trainer',
                ownerEmail: email || undefined,
                appUrl,
                sprite: spriteUrl,
                balance: coinsValue,
                coins: coinsValue,
            });

            if (response && response.data && response.data.id) {
                localStorage.setItem('hubRegenmonId', response.data.id);
                localStorage.setItem('isRegisteredInHub', 'true');
                setHubId(response.data.id);
                setIsRegistered(true);
            } else if (response.alreadyRegistered && response.data?.id) {
                // Fallback or specific logic for already registered based on appUrl
                localStorage.setItem('hubRegenmonId', response.data.id);
                localStorage.setItem('isRegisteredInHub', 'true');
                setHubId(response.data.id);
                setIsRegistered(true);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (isRegistered && hubId) {
        return (
            <div className="flex flex-col gap-4">
                <div className="nes-container is-rounded with-title flex flex-col items-center">
                    <p className="title">HUB MEMBER</p>
                    <div className="nes-badge is-icon w-full justify-center mb-4">
                        <span className="is-warning">🏆</span>
                        <span className="is-success text-xs px-2">{data.name} Registrado</span>
                    </div>

                    <div className="flex gap-4 w-full justify-center">
                        <button
                            onClick={() => router.push('/leaderboard')}
                            className="nes-btn is-warning text-xs w-full sm:w-auto"
                        >
                            🏆 Leaderboard
                        </button>
                        <button
                            onClick={() => router.push(`/regenmon/${hubId}`)}
                            className="nes-btn is-primary text-xs w-full sm:w-auto"
                        >
                            👤 Mi Perfil
                        </button>
                    </div>
                </div>

                <ActivityFeed hubRegenmonId={hubId} />
            </div>
        );
    }

    // Preview data

    return (
        <div className="nes-container is-rounded with-title">
            <p className="title">Global HUB</p>

            <div className="text-center mb-6">
                <p className="text-xs mb-4">¡Únete al Ranking Global y compite con otros Regenmons!</p>

                <div className="nes-container is-rounded inline-block p-4 bg-gray-900 mx-auto">
                    <Image
                        src={currentSprite}
                        alt={data.name}
                        width={100}
                        height={100}
                        className="pixelated mx-auto"
                    />
                    <p className="text-sm text-yellow-400 mt-2">{data.name}</p>
                    <p className="text-[10px] text-gray-400">Owner: {playerName || 'Trainer'}</p>
                </div>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="nes-field">
                    <label htmlFor="email_field" className="text-xs">Email (Opcional, para recuperar)</label>
                    <input
                        type="email"
                        id="email_field"
                        className="nes-input text-xs"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        placeholder="tu@email.com"
                    />
                </div>

                {error && (
                    <p className="nes-text is-error text-xs text-center">{error}</p>
                )}

                <button
                    type="submit"
                    className={`nes-btn w-full ${isLoading ? 'is-disabled' : 'is-success'}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Conectando...' : 'Registrar en el HUB'}
                </button>
            </form>
        </div>
    );
}
