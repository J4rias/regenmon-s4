import { useCallback, useEffect, useRef } from 'react';
import { useHub } from './useHub';

export function useHubSync({
    stats,
    totalPoints,
    trainingHistory,
    sprite,
    stage,
    onSyncSuccess,
}: {
    stats: any;
    totalPoints: number;
    trainingHistory: any[];
    sprite?: string;
    stage?: number;
    onSyncSuccess?: (hubData: any) => void;
}) {
    const { syncStats } = useHub();
    const lastSyncRef = useRef<number>(0);

    const latestData = useRef({ stats, totalPoints, trainingHistory, sprite, stage, onSyncSuccess });

    useEffect(() => {
        latestData.current = { stats, totalPoints, trainingHistory, sprite, stage, onSyncSuccess };
    }, [stats, totalPoints, trainingHistory, sprite, stage, onSyncSuccess]);

    const triggerSync = useCallback(async () => {
        const isRegistered = localStorage.getItem('isRegisteredInHub') === 'true';
        const hubRegenmonId = localStorage.getItem('hubRegenmonId');

        if (!isRegistered || !hubRegenmonId) {
            return;
        }

        // Debounce to prevent multiple rapid syncs
        const now = Date.now();
        if (now - lastSyncRef.current < 5000) {
            return;
        }

        lastSyncRef.current = now;

        const { stats, totalPoints, trainingHistory, sprite, stage, onSyncSuccess } = latestData.current;

        try {
            const response = await syncStats({
                regenmonId: hubRegenmonId,
                stats,
                totalPoints,
                trainingHistory,
                sprite,
                stage,
            });

            if (response && response.data) {
                if (onSyncSuccess) {
                    onSyncSuccess(response.data);
                }
            }
        } catch (error) {
            console.error('Error auto-syncing with HUB:', error);
            // Fail silently for background syncs as per requirements
        }
    }, [syncStats]);

    // Passive 5-minute interval sync
    useEffect(() => {
        const interval = setInterval(() => {
            triggerSync();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [triggerSync]);

    return { triggerSync };
}
