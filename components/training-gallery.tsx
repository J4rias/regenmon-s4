"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { CeldaIcon } from "./celda-icon";

interface TrainingGalleryProps {
    regenmonId: string;
}

const CATEGORY_COLORS: Record<string, { bg: string, text: string }> = {
    "Código": { bg: "#209cee", text: "#fff" }, // Blue
    "Diseño": { bg: "#f7d51d", text: "#000" }, // Yellow
    "Proyecto": { bg: "#92cc41", text: "#000" }, // Green
    "Aprendizaje": { bg: "#9c27b0", text: "#fff" }, // Purple
};

export function TrainingGallery({ regenmonId }: TrainingGalleryProps) {
    // Necesitamos pasar el regenmonId casteado dinámicamente o asumiendo el tipo correcto
    const trainings = useQuery(api.training.getTrainingHistory, { regenmonId: regenmonId as any });

    if (trainings === undefined) {
        return (
            <div className="flex justify-center p-4">
                <span className="animate-pulse">Cargando galería...</span>
            </div>
        );
    }

    if (trainings.length === 0) {
        return (
            <div className="p-4 text-center text-xs text-gray-500 italic">
                Aún no hay entrenamientos. ¡Sube tu primer avance!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {trainings.map((training) => (
                <div key={training._id} className="nes-container is-rounded p-3 flex flex-col items-center bg-gray-800 text-white shadow-md relative overflow-hidden group">
                    {/* Badge Categoría */}
                    <div
                        className="absolute top-0 right-0 px-2 py-1 text-[10px] sm:text-xs font-bold rounded-bl"
                        style={{
                            backgroundColor: CATEGORY_COLORS[training.category]?.bg || "#333",
                            color: CATEGORY_COLORS[training.category]?.text || "#fff"
                        }}
                    >
                        {training.category}
                    </div>

                    {/* Fecha */}
                    <div className="absolute top-1 left-2 text-[9px] text-gray-400">
                        {new Date(training.timestamp).toLocaleDateString()}
                    </div>

                    {/* Score (Big) */}
                    <div className="text-xl sm:text-3xl font-bold mt-4 mb-2 flex flex-col items-center" style={{ color: training.score >= 80 ? '#92cc41' : (training.score >= 50 ? '#f7d51d' : '#e76e55') }}>
                        {training.score} <span className="text-[10px] text-gray-400">PTS</span>
                    </div>

                    {/* Imagen o Placeholder */}
                    <div className="w-full h-24 sm:h-32 mb-2 bg-black rounded border-2 border-dashed border-gray-600 flex items-center justify-center relative overflow-hidden">
                        {training.imageBase64 ? (
                            <Image
                                src={`data:image/png;base64,${training.imageBase64}`}
                                alt="Training Upload"
                                fill
                                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                unoptimized
                            />
                        ) : (
                            <i className="nes-icon is-large star opacity-30"></i>
                        )}
                    </div>

                    {/* Feedback (Truncado) */}
                    <div className="text-[10px] text-center italic line-clamp-3 mb-2 flex-grow">
                        "{training.feedback}"
                    </div>

                    {/* Recompensas */}
                    <div className="flex justify-between w-full mt-2 text-xs border-t border-gray-600 pt-2">
                        <span className="text-blue-300">+{training.points} EXP</span>
                        <span className="text-green-400 flex items-center gap-1">+{training.coins} <CeldaIcon className="w-3 h-4" /></span>
                    </div>
                </div>
            ))}
        </div>
    );
}
