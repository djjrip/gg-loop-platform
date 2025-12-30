import { db } from './database';
import { riotAccounts, processedRiotMatches } from '@shared/schema';
import { getRiotAPI } from './lib/riot';
import { eq, and } from 'drizzle-orm';
import { pointsEngine } from './pointsEngine';
import { AchievementDetector } from './achievementDetector';
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MATCHES_TO_CHECK = 5; // Only check last 5 matches per sync
let syncInterval = null;
let achievementDetector = null;
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 3;
export function initializeAchievementDetector(storage) {
    achievementDetector = new AchievementDetector(storage);
}
export async function startMatchSyncService() {
    console.log('[MatchSync] Starting match sync service...');
    // Run immediately on startup (with error protection)
    try {
        await syncAllAccounts();
        consecutiveErrors = 0; // Reset on success
    }
    catch (error) {
        consecutiveErrors++;
        console.error(`[MatchSync] Error during initial sync (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`, error);
    }
    // Then run every 5 minutes with circuit breaker
    syncInterval = setInterval(async () => {
        try {
            await syncAllAccounts();
            consecutiveErrors = 0; // Reset on success
        }
        catch (error) {
            consecutiveErrors++;
            console.error(`[MatchSync] Error during sync (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`, error);
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                console.error('[MatchSync] ⚠️ Circuit breaker triggered - stopping service due to repeated failures');
                stopMatchSyncService();
                // Notify founder
                try {
                    const { notify } = await import('./alerts');
                    await notify({
                        severity: 'critical',
                        source: 'MatchSyncService',
                        message: `Match sync service disabled after ${MAX_CONSECUTIVE_ERRORS} consecutive failures. Manual restart required.`
                    });
                }
                catch (notifyError) {
                    console.error('[MatchSync] Failed to send alert:', notifyError);
                }
            }
        }
    }, SYNC_INTERVAL_MS);
    console.log(`[MatchSync] Service started. Syncing every ${SYNC_INTERVAL_MS / 1000 / 60} minutes.`);
}
export function stopMatchSyncService() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('[MatchSync] Service stopped.');
    }
}
// Function exposed for Manual Sync API
export async function syncUserByUserId(userId) {
    const [account] = await db.select().from(riotAccounts).where(eq(riotAccounts.userId, userId));
    if (!account) {
        throw new Error("No linked Riot account found");
    }
    let stats = { fetched: 0, inserted: 0, skipped: 0 };
    if (account.game === 'league') {
        stats = await syncLeagueAccount(account);
    }
    else if (account.game === 'valorant') {
        stats = await syncValorantAccount(account);
    }
    else if (account.game === 'tft') {
        stats = await syncTFTAccount(account);
    }
    // Update lastSyncAt
    await db.update(riotAccounts)
        .set({ lastSyncAt: new Date() })
        .where(eq(riotAccounts.id, account.id));
    // Check achievements
    if (stats.inserted > 0 && achievementDetector) {
        await achievementDetector.checkAndAwardAchievements(account.userId, account.game);
    }
    return stats;
}
async function syncAllAccounts() {
    try {
        console.log('[MatchSync] Starting sync cycle...');
        const accounts = await db.select().from(riotAccounts);
        if (accounts.length === 0) {
            console.log('[MatchSync] No Riot accounts linked. Skipping sync.');
            return;
        }
        console.log(`[MatchSync] Syncing ${accounts.length} accounts...`);
        for (const account of accounts) {
            try {
                let stats = { fetched: 0, inserted: 0, skipped: 0 };
                if (account.game === 'league') {
                    stats = await syncLeagueAccount(account);
                }
                else if (account.game === 'valorant') {
                    stats = await syncValorantAccount(account);
                }
                else if (account.game === 'tft') {
                    stats = await syncTFTAccount(account);
                }
                if (stats.inserted > 0) {
                    // Update timestamp if new matches found (or should we update always? Background sync usually updates mainly on success)
                    await db.update(riotAccounts)
                        .set({ lastSyncAt: new Date() })
                        .where(eq(riotAccounts.id, account.id));
                    if (achievementDetector) {
                        console.log(`[MatchSync] Checking achievements for user ${account.userId}...`);
                        await achievementDetector.checkAndAwardAchievements(account.userId, account.game);
                    }
                }
            }
            catch (error) {
                console.error(`[MatchSync] Error syncing account ${account.puuid}:`, error.message);
            }
        }
        console.log('[MatchSync] Sync cycle completed.');
    }
    catch (error) {
        console.error('[MatchSync] Fatal error during sync:', error);
    }
}
async function syncLeagueAccount(account) {
    const riotAPI = getRiotAPI();
    const stats = { fetched: 0, inserted: 0, skipped: 0 };
    const platformRegion = account.region;
    const routingRegion = platformRegion.startsWith('na') || platformRegion.startsWith('br') || platformRegion.startsWith('la') ? 'americas' :
        platformRegion.startsWith('kr') || platformRegion.startsWith('jp') ? 'asia' :
            platformRegion.startsWith('oc') || platformRegion.startsWith('ph') || platformRegion.startsWith('sg') || platformRegion.startsWith('th') || platformRegion.startsWith('tw') || platformRegion.startsWith('vn') ? 'sea' :
                'europe';
    const matchIds = await riotAPI.getLeagueMatchIds(account.puuid, platformRegion, { count: MATCHES_TO_CHECK });
    stats.fetched = matchIds.length;
    console.log(`[MatchSync] Found ${matchIds.length} recent League matches for ${account.gameName}#${account.tagLine}`);
    for (const matchId of matchIds) {
        const [existing] = await db.select().from(processedRiotMatches).where(and(eq(processedRiotMatches.matchId, matchId), eq(processedRiotMatches.riotAccountId, account.id)));
        if (existing) {
            stats.skipped++;
            continue;
        }
        const matchData = await riotAPI.getLeagueMatch(matchId, platformRegion);
        const participant = matchData.info.participants.find((p) => p.puuid === account.puuid);
        if (!participant) {
            console.warn(`[MatchSync] Player not found in match ${matchId}`);
            stats.skipped++;
            continue;
        }
        const didWin = participant.win;
        const gameEndedAt = new Date(matchData.info.gameEndTimestamp);
        const pointsTransaction = await pointsEngine.awardPoints(account.userId, 5, // Base points
        'MATCH_WIN', matchId, 'match', `Match Win (${account.game})`);
        const pointsAwarded = pointsTransaction.amount;
        console.log(`[MatchSync] - Recording match ${matchId} (Win). Awarded ${pointsAwarded} points.`);
        await db.insert(processedRiotMatches).values({
            riotAccountId: account.id,
            matchId,
            gameEndedAt: gameEndedAt,
            isWin: didWin,
            pointsAwarded: pointsAwarded,
            transactionId: pointsTransaction.id,
        });
        stats.inserted++;
    }
    return stats;
}
async function syncValorantAccount(account) {
    const riotAPI = getRiotAPI();
    const stats = { fetched: 0, inserted: 0, skipped: 0 };
    const routingRegion = account.region.startsWith('na') || account.region.startsWith('br') || account.region.startsWith('latam') ? 'na' :
        account.region.startsWith('eu') ? 'eu' :
            account.region.startsWith('kr') ? 'kr' :
                account.region.startsWith('ap') ? 'ap' : 'na';
    const matchIds = await riotAPI.getValorantMatchIds(account.puuid, routingRegion);
    const recentMatchIds = matchIds.slice(0, MATCHES_TO_CHECK);
    stats.fetched = recentMatchIds.length;
    console.log(`[MatchSync] Found ${recentMatchIds.length} recent Valorant matches for ${account.gameName}#${account.tagLine}`);
    for (const matchId of recentMatchIds) {
        const [existing] = await db.select().from(processedRiotMatches).where(and(eq(processedRiotMatches.matchId, matchId), eq(processedRiotMatches.riotAccountId, account.id)));
        if (existing) {
            stats.skipped++;
            continue;
        }
        const matchData = await riotAPI.getValorantMatch(matchId, routingRegion);
        const participant = matchData.players.find((p) => p.puuid === account.puuid);
        if (!participant) {
            console.warn(`[MatchSync] Player not found in match ${matchId}`);
            stats.skipped++;
            continue;
        }
        const didWin = participant.won;
        const gameStartMillis = matchData.matchInfo?.gameStartMillis || Date.now();
        const gameLengthMillis = matchData.matchInfo?.gameLengthMillis || 0;
        const gameEndedAt = new Date(gameStartMillis + gameLengthMillis);
        const pointsTransaction = await pointsEngine.awardPoints(account.userId, 5, // Base points
        'MATCH_WIN', matchId, 'match', `Match Win (${account.game})`);
        const pointsAwarded = pointsTransaction.amount;
        console.log(`[MatchSync] - Recording match ${matchId} (Win). Awarded ${pointsAwarded} points.`);
        await db.insert(processedRiotMatches).values({
            riotAccountId: account.id,
            matchId,
            gameEndedAt: gameEndedAt,
            isWin: didWin,
            pointsAwarded: pointsAwarded,
            transactionId: pointsTransaction.id,
        });
        stats.inserted++;
    }
    return stats;
}
async function syncTFTAccount(account) {
    const riotAPI = getRiotAPI();
    const stats = { fetched: 0, inserted: 0, skipped: 0 };
    const matchIds = await riotAPI.getTFTMatchIds(account.puuid, account.region, { count: MATCHES_TO_CHECK });
    stats.fetched = matchIds.length;
    console.log(`[MatchSync] Found ${matchIds.length} recent TFT matches for ${account.gameName}#${account.tagLine}`);
    for (const matchId of matchIds) {
        const [existing] = await db.select().from(processedRiotMatches).where(and(eq(processedRiotMatches.matchId, matchId), eq(processedRiotMatches.riotAccountId, account.id)));
        if (existing) {
            stats.skipped++;
            continue;
        }
        const matchData = await riotAPI.getTFTMatch(matchId, account.region);
        const participant = matchData.info.participants.find((p) => p.puuid === account.puuid);
        if (!participant) {
            console.warn(`[MatchSync] Player not found in match ${matchId}`);
            stats.skipped++;
            continue;
        }
        const placement = participant.placement;
        const isTopFour = placement <= 4;
        const gameEndedAt = new Date(matchData.info.game_datetime);
        const pointsTransaction = await pointsEngine.awardPoints(account.userId, 5, // Base points
        'MATCH_WIN', matchId, 'match', `Match Win (${account.game})`);
        const pointsAwarded = pointsTransaction.amount;
        console.log(`[MatchSync] - Recording TFT match ${matchId} (Top 4). Awarded ${pointsAwarded} points.`);
        await db.insert(processedRiotMatches).values({
            riotAccountId: account.id,
            matchId,
            gameEndedAt: gameEndedAt,
            isWin: isTopFour,
            pointsAwarded: pointsAwarded,
            transactionId: pointsTransaction.id,
        });
        stats.inserted++;
    }
    return stats;
}
