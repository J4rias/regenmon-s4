import { useState } from 'react';
import { useHub } from '@/app/hooks/useHub';

interface SocialActionsProps {
    hubId: string;
    onActionComplete: (cost?: number) => void;
    myBalance: number;
}

export function SocialActions({ hubId, onActionComplete, myBalance }: SocialActionsProps) {
    const { feed, gift, sendMessage } = useHub();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fromId = typeof window !== 'undefined' ? localStorage.getItem('hubRegenmonId') || '' : '';
    const fromName = typeof window !== 'undefined' ? localStorage.getItem('hubOwnerName') || 'Trainer' : 'Trainer';

    const handleFeed = async () => {
        if (myBalance < 10) {
            setErrorMsg('Sin 🍎 suficientes');
            return;
        }

        setErrorMsg(null);
        setIsSending(true);
        try {
            await feed(hubId, fromId);
            onActionComplete(10);
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setIsSending(false);
        }
    };

    const handleGift = async (amount: number) => {
        if (myBalance < amount) {
            setErrorMsg(`Sin ${amount} 🍎`);
            return;
        }

        setErrorMsg(null);
        setIsSending(true);
        try {
            await gift(hubId, fromId, amount);
            onActionComplete(amount);
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setIsSending(false);
        }
    };

    const handleMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setErrorMsg(null);
        setIsSending(true);
        try {
            await sendMessage(hubId, {
                fromRegenmonId: fromId,
                fromName: fromName,
                message: message.trim(),
            });
            setMessage('');
            onActionComplete(); // Re-fetch activities/messages in parent
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="nes-container is-rounded with-title w-full mt-4">
            <p className="title text-xs">Acciones Sociales</p>

            {errorMsg && (
                <p className="nes-text is-error text-xs text-center mb-4">{errorMsg}</p>
            )}

            {/* Acciones Rápidas */}
            <div className="flex flex-col gap-4 mb-6">
                <p className="text-xs text-center text-gray-400">Mis Celdas: {myBalance}</p>
                <button
                    onClick={handleFeed}
                    disabled={myBalance < 10 || isSending}
                    className={`nes-btn w-full text-xs ${myBalance < 10 ? 'is-disabled' : 'is-success'}`}
                >
                    🍎 Dar de comer (-10)
                </button>

                <div className="flex gap-2 w-full justify-between">
                    <button
                        onClick={() => handleGift(5)}
                        disabled={myBalance < 5 || isSending}
                        className={`nes-btn flex-1 text-[10px] sm:text-xs ${myBalance < 5 ? 'is-disabled' : 'is-warning'}`}
                    >
                        🎁 5
                    </button>
                    <button
                        onClick={() => handleGift(10)}
                        disabled={myBalance < 10 || isSending}
                        className={`nes-btn flex-1 text-[10px] sm:text-xs ${myBalance < 10 ? 'is-disabled' : 'is-warning'}`}
                    >
                        🎁 10
                    </button>
                    <button
                        onClick={() => handleGift(25)}
                        disabled={myBalance < 25 || isSending}
                        className={`nes-btn flex-1 text-[10px] sm:text-xs ${myBalance < 25 ? 'is-disabled' : 'is-warning'}`}
                    >
                        🎁 25
                    </button>
                </div>
            </div>

            {/* Enviar Mensaje */}
            <form onSubmit={handleMessage} className="flex flex-col gap-2">
                <label htmlFor="messageField" className="text-xs">Dejar Mensaje</label>
                <textarea
                    id="messageField"
                    className="nes-textarea text-xs custom-scrollbar"
                    rows={2}
                    maxLength={140}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe algo cool..."
                    disabled={isSending}
                />
                <div className="flex justify-between items-center">
                    <span className={`text-[10px] ${message.length === 140 ? 'nes-text is-error' : 'text-gray-500'}`}>
                        {message.length}/140
                    </span>
                    <button
                        type="submit"
                        className={`nes-btn text-xs ${message.length === 0 || isSending ? 'is-disabled' : 'is-primary'}`}
                        disabled={message.length === 0 || isSending}
                    >
                        Enviar 📨
                    </button>
                </div>
            </form>
        </div>
    );
}
