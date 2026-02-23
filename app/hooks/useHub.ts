import { useCallback, useState } from 'react';

const HUB_API_URL = 'https://regenmon-final.vercel.app/api';

export function useHub() {
    const [isLoading, setIsLoading] = useState(false);

    const request = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${HUB_API_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                throw new Error('Invalid JSON response');
            }

            if (!response.ok || data.success === false) {
                throw new Error(data.message || data.error || 'Error de conexión con el HUB');
            }

            return data;
        } catch (error: any) {
            console.error('HUB Error:', error);
            // If it's our own error from the block above we rethrow it
            if (error.message && error.message !== 'Failed to fetch') {
                throw error;
            }
            throw new Error('El HUB está descansando, intenta después 🍎');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback((data: { name: string; ownerName: string; ownerEmail?: string; appUrl: string; sprite: string }) => {
        return request('/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }, [request]);

    const syncStats = useCallback((data: { regenmonId: string; stats: any; totalPoints: number; trainingHistory: any[]; sprite?: string; stage?: number }) => {
        return request('/sync', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }, [request]);

    const getLeaderboard = useCallback((page = 1, limit = 10) => {
        return request(`/leaderboard?page=${page}&limit=${limit}`);
    }, [request]);

    const getProfile = useCallback((id: string) => {
        return request(`/regenmon/${id}`);
    }, [request]);

    const feed = useCallback((id: string, fromRegenmonId: string) => {
        return request(`/regenmon/${id}/feed`, {
            method: 'POST',
            body: JSON.stringify({ fromRegenmonId }),
        });
    }, [request]);

    const gift = useCallback((id: string, fromRegenmonId: string, amount: number) => {
        return request(`/regenmon/${id}/gift`, {
            method: 'POST',
            body: JSON.stringify({ fromRegenmonId, amount }),
        });
    }, [request]);

    const getMessages = useCallback((id: string, limit = 20) => {
        return request(`/regenmon/${id}/messages?limit=${limit}`);
    }, [request]);

    const sendMessage = useCallback((id: string, data: { fromRegenmonId: string; fromName: string; message: string }) => {
        return request(`/regenmon/${id}/messages`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }, [request]);

    const getActivity = useCallback((id: string, limit = 10) => {
        return request(`/regenmon/${id}/activity?limit=${limit}`);
    }, [request]);

    return {
        isLoading,
        register,
        syncStats,
        getLeaderboard,
        getProfile,
        feed,
        gift,
        getMessages,
        sendMessage,
        getActivity,
    };
}
