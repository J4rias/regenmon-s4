import { useCallback, useEffect, useRef } from 'react';
import { useHub } from './useHub';

export function useHubSync({
    stats,
    totalPoints,
    trainingHistory,
    sprite,
    stage,
    balance,
    onSyncSuccess,
}: {
    stats: any;
    totalPoints: number;
    trainingHistory: any[];
    sprite?: string;
    stage?: number;
    balance?: number;
    onSyncSuccess?: (hubData: any) => void;
}) {
    const { syncStats } = useHub();
    const lastSyncRef = useRef<number>(0);

    // Use individual refs to avoid stale closure issues in useCallback
    const statsRef = useRef(stats);
    const totalPointsRef = useRef(totalPoints);
    const trainingHistoryRef = useRef(trainingHistory);
    const spriteRef = useRef(sprite);
    const stageRef = useRef(stage);
    const balanceRef = useRef(balance);
    const onSyncSuccessRef = useRef(onSyncSuccess);

    // Keep refs in sync every render - no useEffect needed, refs are always current
    statsRef.current = stats;
    totalPointsRef.current = totalPoints;
    trainingHistoryRef.current = trainingHistory;
    spriteRef.current = sprite;
    stageRef.current = stage;
    balanceRef.current = balance;
    onSyncSuccessRef.current = onSyncSuccess;

    const triggerSync = useCallback(async () => {
        const isRegistered = localStorage.getItem('isRegisteredInHub') === 'true';
        const hubRegenmonId = localStorage.getItem('hubRegenmonId');

        if (!isRegistered || !hubRegenmonId) {
            return;
        }

        // Debounce to prevent multiple rapid syncs (2 seconds to allow balance chain updates)
        const now = Date.now();
        if (now - lastSyncRef.current < 2000) {
            return;
        }

        lastSyncRef.current = now;

        // Read from individual refs to get the very latest values
        const currentBalance = typeof balanceRef.current === 'number'
            ? balanceRef.current
            : Number(balanceRef.current) || 0;

        console.log('[HubSync] Syncing balance:', currentBalance, 'totalPoints:', totalPointsRef.current);

        try {
            const response = await syncStats({
                regenmonId: hubRegenmonId,
                stats: statsRef.current,
                totalPoints: totalPointsRef.current,
                trainingHistory: trainingHistoryRef.current,
                sprite: spriteRef.current,
                stage: stageRef.current,
                balance: currentBalance,
                coins: currentBalance,
            });

            if (response && response.data) {
                if (onSyncSuccessRef.current) {
                    onSyncSuccessRef.current(response.data);
                }
            }
        } catch (error) {
            console.error('Error auto-syncing with HUB:', error);
        }
        // syncStats is stable from useHub, no other deps needed since we use refs
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
