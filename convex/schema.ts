import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users table: Stores user profile and tutorial progress
    users: defineTable({
        tokenIdentifier: v.string(), // Privy Auth ID
        name: v.string(),            // Display Name
        email: v.optional(v.string()), // User's email
        tutorialsSeen: v.array(v.string()), // List of seen tutorial IDs
    }).index("by_token", ["tokenIdentifier"]),

    // Regenmons table: Stores the active pet for each user
    regenmons: defineTable({
        userId: v.id("users"),       // Reference to users table
        name: v.string(),            // Pet Name
        type: v.string(),            // Archetype ID
        stats: v.object({
            happiness: v.number(),
            energy: v.number(),
            hunger: v.number(),
        }),
        coins: v.number(),           // Cell balance
        createdAt: v.number(),       // Timestamp
        lastDailyReward: v.optional(v.string()), // ISO date for daily reward tracking
        dailyRewardsClaimed: v.optional(v.number()), // Tracks 3x limit
        dailyChatEarnings: v.optional(v.number()), // Tracks chat farming cap
        lastChatEarningDate: v.optional(v.string()), // ISO date to reset cap

        // Game State Tracking
        isGameOver: v.optional(v.boolean()),
        gameOverAt: v.optional(v.string()),
        evolutionBonus: v.optional(v.number()),
        chatHistory: v.optional(v.array(v.any())),
        history: v.optional(v.array(v.any())),

        // Training System Fields
        totalPoints: v.optional(v.number()),     // Puntos acumulados de todos los entrenamientos
        evolutionStage: v.optional(v.number()),  // 1, 2, o 3
        trainingHistory: v.optional(v.array(v.any())), // fallback for local if needed, but we use the table
    }).index("by_user", ["userId"]),

    // Trainings table: Stores history of AI evaluations
    trainings: defineTable({
        regenmonId: v.id("regenmons"),
        category: v.string(),        // 'Código', 'Diseño', 'Proyecto', 'Aprendizaje'
        score: v.number(),           // 0-100
        feedback: v.string(),        // Comentarios de la IA
        coins: v.number(),           // Monedas ganadas
        points: v.number(),          // Puntos ganados (igual al score)
        imageBase64: v.optional(v.string()), // Miniatura opcional
        timestamp: v.string(),       // ISO Date
    }).index("by_regenmon", ["regenmonId"]),

    // Actions table: Complete history of all game events
    actions: defineTable({
        regenmonId: v.id("regenmons"), // Reference to regenmon
        type: v.string(),            // 'feed', 'play', 'sleep', 'chat', 'earn'
        details: v.any(),            // JSON details (amount, message, etc.)
        timestamp: v.string(),       // ISO Date
    }).index("by_regenmon", ["regenmonId"]),
});
