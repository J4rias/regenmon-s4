"use client";

import { TRAINING_STAGE_THRESHOLDS } from "../lib/regenmon-types";

interface EvolutionProgressProps {
    totalPoints: number;
    stage: number;
}

export function EvolutionProgress({ totalPoints, stage }: EvolutionProgressProps) {
    const getNextThreshold = () => {
        if (stage === 1) return TRAINING_STAGE_THRESHOLDS.ST2;
        if (stage === 2) return TRAINING_STAGE_THRESHOLDS.ST3;
        return TRAINING_STAGE_THRESHOLDS.ST3;
    };

    const nextThreshold = getNextThreshold();
    const progressPercent = stage === 3 ? 100 : Math.min(100, (totalPoints / nextThreshold) * 100);

    return (
        <div className="w-full mt-4">
            <div className="flex justify-between items-end mb-1">
                <span className="text-xs">Stage {stage}/3</span>
                <span className="text-xs">
                    {stage === 3 ? "¡Etapa Maxima!" : `Prox: ${totalPoints}/${nextThreshold} pts`}
                </span>
            </div>
            <progress
                className="nes-progress is-primary"
                value={totalPoints}
                max={nextThreshold}
            ></progress>
            <div className="text-center mt-2">
                <p className="text-[10px] text-gray-500">
                    Total: {totalPoints} pts acumulados
                </p>
            </div>
        </div>
    );
}
