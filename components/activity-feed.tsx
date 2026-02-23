import { useEffect, useState } from 'react';
import { useHub } from '@/app/hooks/useHub';

interface ActivityItem {
    type: string;
    description: string;
    amount?: number;
    createdAt: string;
}

export function ActivityFeed({ hubRegenmonId }: { hubRegenmonId: string }) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const { getActivity, isLoading } = useHub();

    useEffect(() => {
        async function loadActivity() {
            if (!hubRegenmonId) return;
            try {
                const response = await getActivity(hubRegenmonId, 10);
                if (response && response.data && response.data.activity) {
                    setActivities(response.data.activity);
                }
            } catch (error) {
                console.error('Error loading activity feed:', error);
            }
        }
        loadActivity();
    }, [hubRegenmonId, getActivity]);

    return (
        <div className="nes-container is-rounded with-title mt-4 bg-gray-900 w-full">
            <p className="title text-xs">Actividad Reciente</p>

            {isLoading ? (
                <p className="text-xs text-center text-gray-500 py-4">Cargando actividad...</p>
            ) : activities.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {activities.map((activity, index) => (
                        <div key={index} className="flex flex-col border-b border-gray-800 pb-2 last:border-0 text-[10px] sm:text-xs">
                            <span className="text-gray-300">{activity.description}</span>
                            <span className="text-gray-500 text-[9px] text-right mt-1">
                                {new Date(activity.createdAt).toLocaleString([], {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-[10px] sm:text-xs text-center text-gray-500 py-4 italic">
                    Aún no hay actividad. ¡Comparte tu perfil!
                </p>
            )}
        </div>
    );
}
