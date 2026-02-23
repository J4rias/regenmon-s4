"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/components/language-provider";
import { t } from "@/lib/i18n";

interface TrainingPanelProps {
    onEvaluate: (imageBase64: string, category: string) => Promise<void>;
    onCancel: () => void;
    isEvaluating: boolean;
}

const CATEGORIES = [
    { id: "Código", icon: "💻", labelKey: "trainingBestCode" },
    { id: "Diseño", icon: "🎨", labelKey: "trainingDesign" },
    { id: "Proyecto", icon: "🚀", labelKey: "trainingProject" },
    { id: "Aprendizaje", icon: "📚", labelKey: "trainingLearning" },
];

export function TrainingPanel({ onEvaluate, onCancel, isEvaluating }: TrainingPanelProps) {
    const { locale } = useLanguage();
    const s = t(locale);
    const [selectedCategory, setSelectedCategory] = useState<string>("Código");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError(s.trainingFileTooLarge);
            return;
        }

        setError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleEvaluate = async () => {
        if (!previewImage) return;
        const base64Data = previewImage.split(",")[1];
        await onEvaluate(base64Data, selectedCategory);
    };

    return (
        <div className="nes-container with-title is-centered p-4">
            <p className="title">🎓 {s.trainingTitle}</p>

            {!previewImage ? (
                <>
                    <p className="mb-4">{s.trainingChooseCategory}</p>

                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                className={`nes-btn w-full text-xs sm:text-sm ${selectedCategory === cat.id ? "is-warning" : ""
                                    }`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                <span className="block text-xl mb-1">{cat.icon}</span>
                                {s[cat.labelKey as keyof typeof s]}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col items-center">
                        <button
                            type="button"
                            className="nes-btn is-primary mb-2"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            📸 {s.trainingUploadButton}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        {error && <p className="nes-text is-error text-xs mt-2">{error}</p>}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center">
                    <div
                        className="relative w-full mb-4 border-4 border-orange-500 rounded overflow-hidden"
                        style={{ height: "300px" }}
                    >
                        <Image
                            src={previewImage}
                            alt="Preview"
                            fill
                            className="object-contain bg-black"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            disabled={isEvaluating}
                            className={`nes-btn ${isEvaluating ? "is-disabled" : "is-success"}`}
                            onClick={handleEvaluate}
                        >
                            {isEvaluating ? `🔄 ${s.trainingEvaluating}` : `✅ ${s.trainingEvaluateButton}`}
                        </button>
                        {!isEvaluating && (
                            <button className="nes-btn is-error" onClick={() => setPreviewImage(null)}>
                                ❌ {s.trainingCancelButton}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-6">
                <button className="nes-btn is-normal w-full" onClick={onCancel}>
                    {s.trainingCloseButton}
                </button>
            </div>
        </div>
    );
}
