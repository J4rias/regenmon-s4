'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHub } from '@/app/hooks/useHub';
import { SocialActions } from '@/components/social-actions';
import { CeldaIcon } from '@/components/celda-icon';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function PublicProfilePage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { getProfile, getMessages, isLoading, visit } = useHub();

    const [profile, setProfile] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isMyProfile, setIsMyProfile] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    // For SocialActions to use
    const myRegenmon = useQuery(api.regenmon.get);
    const updateRegenmon = useMutation(api.regenmon.update);
    const myBalance = myRegenmon?.coins || 0;

    useEffect(() => {
        const hubId = localStorage.getItem('hubRegenmonId');
        const registered = localStorage.getItem('isRegisteredInHub') === 'true';

        setIsRegistered(registered);
        if (hubId && hubId === id) {
            setIsMyProfile(true);
        }
    }, [id]);

    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            setIsFetching(true);
            try {
                const [profData, msgData] = await Promise.all([
                    getProfile(id),
                    getMessages(id, 20)
                ]);

                if (profData?.data) {
                    setProfile(profData.data);
                }
                if (msgData?.data?.messages) {
                    setMessages(msgData.data.messages);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setIsFetching(false);
            }
        }
        fetchProfile();
    }, [id, getProfile, getMessages]);

    const handleActionComplete = async () => {
        // Determine the cost in social-actions, or just refetch here
        // Refresh messages and profile after an action (like feed or gift)
        try {
            const [profData, msgData] = await Promise.all([
                getProfile(id),
                getMessages(id, 20)
            ]);

            if (profData?.data) {
                setProfile(profData.data);
            }
            if (msgData?.data?.messages) {
                setMessages(msgData.data.messages);
            }
        } catch (error) {
            console.error('Error refreshing after action:', error);
        }

        // We should also reduce local balance manually or via convex logic
        // Usually SocialActions expects the local balance to be updated by the parent,
        // but the API call to HUB was successful. We don't know the exact amount here easily,
        // so ideally we'd pass the cost up, or just re-fetch the local convex state (which happens automatically if we mutate).
        // WAIT, to deduct via Convex safely:
        // (We will let the child component deduct it visually or we can wait for `onUpdate` equivalent)
    };

    const deductLocalBalance = async (cost: number) => {
        if (!myRegenmon || !myRegenmon._id) return;
        const newCoins = Math.max(0, (myRegenmon.coins || 0) - cost);
        // Add history action locally
        const newAction = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type: 'feed' as const, // Or gift/play based on what it is, using 'feed' as placeholder expense
            amount: -cost,
            date: new Date().toISOString()
        };

        const newHistory = [newAction, ...(myRegenmon.history || [])].slice(0, 10);

        await updateRegenmon({
            regenmonId: myRegenmon._id,
            coins: newCoins,
            history: newHistory
        });
    };

    if (isFetching) {
        return (
            <div className="flex min-h-screen flex-col items-center bg-black p-4 text-white">
                <div className="w-full max-w-2xl">
                    <button disabled className="nes-btn is-disabled text-xs mb-4 w-24 h-10"></button>

                    <div className="nes-container is-rounded is-dark flex flex-col items-center p-6 opacity-50 animate-pulse">
                        <div className="flex flex-col items-center w-full">
                            <div className="w-48 h-8 bg-gray-800 rounded mb-2"></div>
                            <div className="w-32 h-4 bg-gray-800 rounded mb-6"></div>

                            <div className="bg-gray-900 w-48 h-48 rounded-lg mb-6 shadow-lg border border-gray-700"></div>

                            <div className="flex gap-6 w-full justify-center mb-6">
                                <div className="w-16 h-12 bg-gray-800 rounded"></div>
                                <div className="w-16 h-12 bg-gray-800 rounded"></div>
                                <div className="w-16 h-12 bg-gray-800 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
                <p className="text-red-500 mb-4">Regenmon no encontrado en el HUB.</p>
                <button onClick={() => router.push('/leaderboard')} className="nes-btn">Volver</button>
            </div>
        );
    }

    // Safe fallback for stats
    const stats = profile?.stats || { happiness: 50, energy: 50, hunger: 50 };

    return (
        <div className="flex min-h-screen flex-col items-center bg-black p-4 text-white">
            <div className="w-full max-w-2xl">
                <button onClick={() => router.back()} className="nes-btn text-xs mb-4">← Volver</button>

                {/* Profile Card */}
                <div className="nes-container is-rounded is-dark flex flex-col items-center p-6">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-2xl text-yellow-400 mb-2">{profile?.name}</h1>
                        <p className="text-[10px] sm:text-xs text-gray-400 mb-4">Owner: {profile?.ownerName}</p>

                        {profile?.appUrl && (
                            <a
                                href={profile.appUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                    visit(id).catch(console.error);
                                }}
                                className="nes-btn is-primary text-[10px] mb-6"
                            >
                                🎮 Visit Student App →
                            </a>
                        )}

                        <div className="bg-gray-900 p-8 rounded-lg mb-6 shadow-lg inline-block relative border border-gray-700">
                            {profile?.sprite ? (
                                <img
                                    src={profile.sprite}
                                    alt={profile.name}
                                    className="w-32 h-32 pixelated animate-breathe mx-auto"
                                />
                            ) : (
                                <span className="text-6xl">🥚</span>
                            )}
                            {/* Stage Badge */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black border border-white px-2 py-1 rounded text-[10px]">
                                Etapa {profile?.stage || 1}
                            </div>
                        </div>

                        <div className="flex gap-6 mb-6">
                            <div className="text-center">
                                <p className="text-[10px] text-gray-500 mb-1">Puntos</p>
                                <p className="text-sm font-bold text-blue-400">{profile?.totalPoints || 0}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-500 mb-1">Celdas ($FRUTA)</p>
                                <p className="text-sm font-bold text-green-400 flex items-center justify-center gap-1">
                                    {profile?.balance || 0} <CeldaIcon className="w-3 h-4" />
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-500 mb-1">Visitas</p>
                                <p className="text-sm font-bold text-purple-400">{profile?.totalVisits || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Progress Bars */}
                    <div className="w-full flex flex-col gap-3 mt-4 border-t border-gray-800 pt-6">
                        <p className="text-xs text-center text-gray-400 mb-2">Estado Actual</p>
                        <div className="flex items-center gap-2">
                            <span className="w-20 text-[10px]">Felicidad</span>
                            <progress className="nes-progress is-primary flex-1 h-4" value={stats.happiness} max="100"></progress>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-20 text-[10px]">Energía</span>
                            <progress className="nes-progress is-warning flex-1 h-4" value={stats.energy} max="100"></progress>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-20 text-[10px]">Hambre</span>
                            <progress className="nes-progress is-success flex-1 h-4" value={stats.hunger} max="100"></progress>
                        </div>
                    </div>
                </div>

                {/* Social Actions & Messaging Wrapper */}
                <div className="mt-8">
                    {isMyProfile ? (
                        <div className="nes-container is-rounded is-dark text-center">
                            <p className="text-xs text-yellow-400">Este es tu Regenmon.</p>
                            <p className="text-[10px] text-gray-400 mt-2">¡Comparte el link para que otros lo visiten!</p>
                        </div>
                    ) : !isRegistered ? (
                        <div className="nes-container is-rounded is-dark text-center">
                            <p className="text-[10px] sm:text-xs text-gray-400">
                                Regístrate en la pestaña <strong className="text-white">Social</strong> de tu Dashboard para interactuar.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Only inject SocialActions if the user relies on their local balance deduction internally or we wrap it */}
                            <SocialActions
                                hubId={id}
                                onActionComplete={(cost) => {
                                    if (cost && cost > 0) {
                                        deductLocalBalance(cost);
                                    }
                                    handleActionComplete();
                                }}
                                myBalance={myBalance}
                            />
                        </>
                    )}

                    {/* Messages List Area */}
                    <div className="nes-container is-rounded is-dark mt-6 mb-12">
                        <p className="title text-xs">Mensajes</p>

                        {messages.length === 0 ? (
                            <p className="text-[10px] sm:text-xs text-center text-gray-500 py-4 italic">No hay mensajes aún.</p>
                        ) : (
                            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                {messages.map((msg: any) => (
                                    <div key={msg.id || msg.createdAt} className="bg-gray-900 p-3 rounded border border-gray-800">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] sm:text-xs text-yellow-500 font-bold">{msg.fromName}</span>
                                            <span className="text-[9px] text-gray-500">
                                                {/* Simple relative time logic or display short date */}
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-gray-300 break-words">{msg.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
