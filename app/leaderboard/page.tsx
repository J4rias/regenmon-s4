'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHub } from '@/app/hooks/useHub';
import Image from 'next/image';
import { CeldaIcon } from '@/components/celda-icon';

interface LeaderboardItem {
    rank: number;
    id: string;
    name: string;
    ownerName: string;
    sprite: string;
    stage: number;
    totalPoints: number;
    balance: number;
}

export default function LeaderboardPage() {
    const router = useRouter();
    const { getLeaderboard, isLoading } = useHub();
    const [items, setItems] = useState<LeaderboardItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const response = await getLeaderboard(page, 10);
                if (response && response.data) {
                    setItems(response.data);
                    if (response.pagination) {
                        setTotalPages(response.pagination.totalPages);
                    }
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            }
        }
        fetchLeaderboard();
    }, [page, getLeaderboard]);

    const getRankMedal = (rank: number) => {
        switch (rank) {
            case 1: return <span className="text-2xl" title="First Place">🥇</span>;
            case 2: return <span className="text-2xl" title="Second Place">🥈</span>;
            case 3: return <span className="text-2xl" title="Third Place">🥉</span>;
            default: return <span className="font-bold text-gray-500">#{rank}</span>;
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-black p-4 text-white">
            <div className="w-full max-w-3xl">
                <div className="flex items-center justify-between mb-6 mt-4">
                    <button
                        onClick={() => router.push('/')}
                        className="nes-btn is-error text-xs"
                    >
                        ← Volver
                    </button>
                    <h1 className="text-xl sm:text-2xl text-yellow-400 text-center flex-1 ml-4 shadow-text">🏆 Ranking Global</h1>
                </div>

                <div className="nes-container is-rounded is-dark p-2 sm:p-4">
                    {isLoading ? (
                        <div className="flex flex-col gap-3 py-4 opacity-50 animate-pulse">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between border-b border-gray-700 pb-2 bg-gray-900 p-3 rounded">
                                    <div className="flex items-center gap-3 w-16 sm:w-20 justify-center">
                                        <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-800 rounded"></div>
                                        <div className="flex flex-col gap-2">
                                            <div className="w-24 h-4 bg-gray-800 rounded"></div>
                                            <div className="w-16 h-3 bg-gray-800 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex flex-col items-end px-4 w-24 gap-2">
                                        <div className="w-12 h-3 bg-gray-800 rounded"></div>
                                        <div className="w-16 h-3 bg-gray-800 rounded"></div>
                                    </div>
                                    <div className="pl-2">
                                        <div className="w-16 h-8 bg-gray-800 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <p className="text-center py-10 text-gray-400">Aún no hay Regenmons registrados. ¡Sé el primero!</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between border-b border-gray-700 pb-2 last:border-0 bg-gray-900 p-3 rounded">
                                    <div className="flex items-center gap-3 w-16 sm:w-20 justify-center">
                                        {getRankMedal(item.rank)}
                                    </div>

                                    <div className="flex-1 flex items-center gap-3">
                                        <div className="w-12 h-12 relative bg-gray-800 rounded flex items-center justify-center">
                                            {item.sprite ? (
                                                <img
                                                    src={item.sprite}
                                                    alt={item.name}
                                                    className="w-10 h-10 pixelated"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <span className="text-2xl">🥚</span>
                                            )}
                                        </div>

                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs sm:text-sm text-yellow-400 truncate font-bold">{item.name}</span>
                                            <span className="text-[10px] text-gray-400 truncate">Owner: {item.ownerName}</span>
                                        </div>
                                    </div>

                                    <div className="hidden sm:flex flex-col items-end px-4 w-24">
                                        <span className="text-[10px] text-gray-400">Pt: {item.totalPoints || 0}</span>
                                        <span className="text-[10px] flex items-center gap-1 text-green-400">
                                            {item.balance || 0} <CeldaIcon className="w-3 h-4" />
                                        </span>
                                    </div>

                                    <div className="pl-2">
                                        <button
                                            onClick={() => router.push(`/regenmon/${item.id}`)}
                                            className="nes-btn is-primary px-3 py-1 text-xs"
                                        >
                                            Ver
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && items.length > 0 && (
                        <div className="flex justify-center items-center gap-4 mt-6 mb-2">
                            <button
                                className={`nes-btn text-xs ${page <= 1 ? 'is-disabled' : 'is-warning'}`}
                                disabled={page <= 1 || isLoading}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                ← Ant
                            </button>
                            <span className="text-xs">
                                Pág {page} de {totalPages}
                            </span>
                            <button
                                className={`nes-btn text-xs ${page >= totalPages ? 'is-disabled' : 'is-warning'}`}
                                disabled={page >= totalPages || isLoading}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                Sig →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
