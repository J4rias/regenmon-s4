"use client";

interface ResultCardProps {
    score: number;
    category: string;
    feedback: string;
    points: number;
    coins: number;
    stats: {
        happiness: number;
        energy: number;
        hunger: number;
    };
    onClose: () => void;
}

export function ResultCard({ score, category, feedback, points, coins, stats, onClose }: ResultCardProps) {
    const getEmoji = (s: number) => {
        if (s >= 80) return "🏆";
        if (s >= 60) return "⭐";
        if (s >= 40) return "👍";
        return "💪";
    };

    const getBgColor = (s: number) => {
        if (s >= 80) return "bg-orange-100";
        if (s >= 60) return "bg-yellow-100";
        if (s >= 40) return "bg-yellow-50";
        return "bg-red-50";
    };

    const statEffects = (s: number) => {
        if (s >= 80) return { h: "+15", e: "-20", hu: "+15", text: "Excelente" };
        if (s >= 60) return { h: "+8", e: "-15", hu: "+12", text: "Bueno" };
        if (s >= 40) return { h: "+3", e: "-12", hu: "+10", text: "Regular" };
        return { h: "-10", e: "-15", hu: "+10", text: "Bajo" };
    };

    const effect = statEffects(score);

    return (
        <div className={`nes-container is-rounded p-4 ${getBgColor(score)} text-black`}>
            <div className="text-center mb-4">
                <span className="text-4xl">{getEmoji(score)}</span>
                <h2 className="text-2xl font-bold mt-2">{score}/100</h2>
                <p className="nes-badge">
                    <span className="is-dark">{category}</span>
                </p>
            </div>

            <div className="nes-container is-dark with-title mb-4">
                <p className="title text-xs">Feedback de la IA</p>
                <p className="text-sm italic">"{feedback}"</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="nes-container with-title bg-white">
                    <p className="title text-xs">Recompensas</p>
                    <div className="text-xs">
                        <p className="text-green-600 font-bold">⭐ +{points} Puntos</p>
                        <p className="text-orange-600 font-bold">⚡ +{coins} Celdas</p>
                    </div>
                </div>
                <div className="nes-container with-title bg-white">
                    <p className="title text-xs">Efectos Stats</p>
                    <div className="text-xs">
                        <p className={effect.h.startsWith("+") ? "text-green-600" : "text-red-600"}>
                            Felicidad: {effect.h}
                        </p>
                        <p className="text-red-600">Energía: {effect.e}</p>
                        <p className="text-red-600">Hambre: {effect.hu}</p>
                    </div>
                </div>
            </div>

            <button className="nes-btn is-primary w-full" onClick={onClose}>
                🎓 Entrenar Nuevamente
            </button>
        </div>
    );
}
