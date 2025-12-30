import { steamAccounts } from "@shared/schema";
import { db } from "../database";
import { eq } from "drizzle-orm";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

// --- KEY-GATED API ---

async function fetchPlayerSummary(steamId: string) {
    if (!STEAM_API_KEY || STEAM_API_KEY.includes("TEMPORARY_COOLDOWN")) {
        console.warn("[SteamService] API Key missing or cooldown. Skipping API call.");
        return null; // Graceful fallback
    }
    // TO BE IMPLEMENTED WHEN KEY IS AVAILABLE
    return null;
}

async function fetchOwnedGames(steamId: string) {
    if (!STEAM_API_KEY || STEAM_API_KEY.includes("TEMPORARY_COOLDOWN")) {
        console.warn("[SteamService] API Key missing or cooldown. Skipping API call.");
        return [];
    }
    // TO BE IMPLEMENTED WHEN KEY IS AVAILABLE
    return [];
}

// --- DB OPERATIONS ---

export async function linkSteamAccount(userId: string, steamProfile: any) {
    // Check if checks already linked
    const existing = await db.query.steamAccounts.findFirst({
        where: eq(steamAccounts.steamId, steamProfile.id)
    });

    if (existing) {
        if (existing.userId !== userId) {
            throw new Error("Steam account already linked to another user.");
        }
        return existing; // Already linked
    }

    // Insert new link
    const [inserted] = await db.insert(steamAccounts).values({
        userId,
        steamId: steamProfile.id,
        profileUrl: steamProfile._json.profileurl,
        avatar: steamProfile._json.avatar,
        personaName: steamProfile.displayName
    }).returning();

    return inserted;
}

export async function getSteamAccount(userId: string) {
    return await db.query.steamAccounts.findFirst({
        where: eq(steamAccounts.userId, userId)
    });
}

export async function getSteamTrustSignals(userId: string) {
    const account = await getSteamAccount(userId);

    // Rule: If not linked, return null (or false structure if preferred, but null is safer for "not linked")
    if (!account) {
        return {
            isConnected: false,
            steamId: null,
            trustStatus: null,
            signals: null
        };
    }

    const keyAvailable = STEAM_API_KEY && !STEAM_API_KEY.includes("DISABLED") && !STEAM_API_KEY.includes("COOLDOWN");

    // Rule: Linked + No Key = PENDING_KEY
    // Rule: Linked + Key = VERIFIED
    const trustStatus = keyAvailable ? "VERIFIED" : "PENDING_KEY";

    return {
        isConnected: true,
        steamId: account.steamId,
        trustStatus,
        signals: {
            accountAgeDays: keyAvailable ? 0 : "PENDING_KEY", // Placeholder for actual logic
            gameCount: keyAvailable ? 0 : "PENDING_KEY",
            vacBans: keyAvailable ? 0 : "PENDING_KEY",
            communityBanned: keyAvailable ? false : "PENDING_KEY"
        }
    };
}
