import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Stores or updates a user in the database.
 * If the user exists (by tokenIdentifier), it updates their info.
 * If not, it creates a new user record.
 */
export const store = mutation({
    args: {
        name: v.optional(v.string()),
        email: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication present");
        }

        const email = args.email || identity.email || "";
        const identityName = args.name || identity.name || email || "Explorer";

        // Check if we already have this user
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (user !== null) {
            const updates: any = {};

            // Capture email if we don't have it or if it changed
            if (email && email !== user.email) {
                updates.email = email;
            }

            // Update name logic
            const isCurrentNameGeneric = !user.name || user.name === "Trainer" || user.name === "Explorer" || user.name === "";
            const isNewNameProvidedInArgs = args.name && args.name !== user.name;

            if (isNewNameProvidedInArgs) {
                updates.name = args.name;
            } else if (isCurrentNameGeneric && identityName !== "Explorer" && identityName !== user.name) {
                // If the user's name is a generic default, try to upgrade it to their actual name or email
                updates.name = identityName;
            }

            if (Object.keys(updates).length > 0) {
                await ctx.db.patch(user._id, updates);
            }
            return user._id;
        }

        // Create new user
        return await ctx.db.insert("users", {
            tokenIdentifier: identity.tokenIdentifier,
            name: identityName,
            email: email,
            tutorialsSeen: [],
        });
    },
});

/**
 * Gets the current user's profile.
 */
export const get = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        return user;
    },
});

/**
 * Marks a tutorial as seen for the current user.
 */
export const markTutorialSeen = mutation({
    args: {
        tutorialId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user) throw new Error("User not found");

        if (!user.tutorialsSeen.includes(args.tutorialId)) {
            await ctx.db.patch(user._id, {
                tutorialsSeen: [...user.tutorialsSeen, args.tutorialId],
            });
        }
    },
});
