import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Guarda un resultado de entrenamiento y actualiza las estadísticas y evolución del Regenmon.
 */
export const saveTraining = mutation({
    args: {
        regenmonId: v.id("regenmons"),
        category: v.string(),
        score: v.number(),
        feedback: v.string(),
        imageBase64: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let identity = await ctx.auth.getUserIdentity();
        // MOCK AUTH PARA TESTING:
        if (!identity) {
            console.warn("MOCK AUTH: Permitir sin autenticación para test local");
            // Set a fake user identity
        }

        const regenmon = await ctx.db.get(args.regenmonId);
        if (!regenmon) throw new Error("Regenmon no encontrado");

        // 1. Cálculos de recompensas
        const points = args.score;
        const coins = Math.round(args.score * 0.5);

        // 2. Efectos en Stats
        const currentStats = regenmon.stats;
        let newStats = { ...currentStats };

        if (args.score >= 80) {
            newStats.happiness = Math.min(100, (newStats.happiness ?? 50) + 15);
            newStats.energy = Math.max(0, (newStats.energy ?? 100) - 20);
            newStats.hunger = Math.min(100, (newStats.hunger ?? 0) + 15);
        } else if (args.score >= 60) {
            newStats.happiness = Math.min(100, (newStats.happiness ?? 50) + 8);
            newStats.energy = Math.max(0, (newStats.energy ?? 100) - 15);
            newStats.hunger = Math.min(100, (newStats.hunger ?? 0) + 12);
        } else if (args.score >= 40) {
            newStats.happiness = Math.min(100, (newStats.happiness ?? 50) + 3);
            newStats.energy = Math.max(0, (newStats.energy ?? 100) - 12);
            newStats.hunger = Math.min(100, (newStats.hunger ?? 0) + 10);
        } else {
            newStats.happiness = Math.max(0, (newStats.happiness ?? 50) - 10);
            newStats.energy = Math.max(0, (newStats.energy ?? 100) - 15);
            newStats.hunger = Math.min(100, (newStats.hunger ?? 0) + 10);
        }

        // 3. Sistema de Evolución
        const newTotalPoints = (regenmon.totalPoints ?? 0) + points;
        let newStage = regenmon.evolutionStage ?? 1;
        let evolutionBonus = 0;

        if (newStage === 1 && newTotalPoints >= 500) {
            newStage = 2;
            evolutionBonus = 100;
        } else if (newStage === 2 && newTotalPoints >= 1500) {
            newStage = 3;
            evolutionBonus = 100;
        }

        // 4. Guardar Record de Entrenamiento
        const timestamp = new Date().toISOString();
        await ctx.db.insert("trainings", {
            regenmonId: args.regenmonId,
            category: args.category,
            score: args.score,
            feedback: args.feedback,
            coins,
            points,
            imageBase64: args.imageBase64,
            timestamp,
        });

        // 5. Actualizar Regenmon
        const newCoins = (regenmon.coins ?? 0) + coins + evolutionBonus;

        await ctx.db.patch(args.regenmonId, {
            stats: newStats,
            totalPoints: newTotalPoints,
            evolutionStage: newStage,
            coins: newCoins,
        });

        // 6. Registrar en acciones
        await ctx.db.insert("actions", {
            regenmonId: args.regenmonId,
            type: "earn",
            details: {
                amount: coins,
                source: "training",
                category: args.category,
                score: args.score,
                evolutionBonus: evolutionBonus > 0 ? evolutionBonus : undefined
            },
            timestamp,
        });

        return {
            success: true,
            points,
            coins,
            newTotalPoints,
            didEvolve: evolutionBonus > 0,
            newStage,
            stats: newStats
        };
    },
});

/**
 * Obtiene el historial de entrenamientos de un Regenmon (últimos 20).
 */
export const getTrainingHistory = query({
    args: { regenmonId: v.id("regenmons") },
    handler: async (ctx, args) => {
        const trainings = await ctx.db
            .query("trainings")
            .withIndex("by_regenmon", (q) => q.eq("regenmonId", args.regenmonId))
            .order("desc")
            .take(20);
        return trainings;
    },
});
