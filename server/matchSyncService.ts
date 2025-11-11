import { db } from './db';
import { riotAccounts, processedRiotMatches } from '@shared/schema';
import { getRiotAPI } from './lib/riot';
import { pointsEngine } from './pointsEngine';
import { eq, and, desc } from 'drizzle-orm';

const SYNC_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const MATCHES_TO_CHECK = 5; // Only check last 5 matches per sync

let syncInterval: NodeJS.Timeout | null = null;

export async function startMatchSyncService() {
  console.log('[MatchSync] Starting match sync service...');
  
  // Run immediately on startup
  await syncAllAccounts();
  
  // Then run every 10 minutes
  syncInterval = setInterval(async () => {
    await syncAllAccounts();
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

async function syncAllAccounts() {
  try {
    console.log('[MatchSync] Starting sync cycle...');
    
    // Get all linked Riot accounts
    const accounts = await db.select().from(riotAccounts);
    
    if (accounts.length === 0) {
      console.log('[MatchSync] No Riot accounts linked. Skipping sync.');
      return;
    }
    
    console.log(`[MatchSync] Syncing ${accounts.length} accounts...`);
    
    for (const account of accounts) {
      try {
        if (account.game === 'league') {
          await syncLeagueAccount(account);
        } else if (account.game === 'valorant') {
          await syncValorantAccount(account);
        }
      } catch (error: any) {
        console.error(`[MatchSync] Error syncing account ${account.puuid}:`, error.message);
        // Continue with next account even if this one fails
      }
    }
    
    console.log('[MatchSync] Sync cycle completed.');
  } catch (error) {
    console.error('[MatchSync] Fatal error during sync:', error);
  }
}

async function syncLeagueAccount(account: typeof riotAccounts.$inferSelect) {
  const riotAPI = getRiotAPI();
  
  // Determine regional routing
  const platformRegion = account.region; // e.g., "na1", "euw1"
  const routingRegion = platformRegion.startsWith('na') || platformRegion.startsWith('br') || platformRegion.startsWith('la') ? 'americas' :
                       platformRegion.startsWith('kr') || platformRegion.startsWith('jp') ? 'asia' :
                       platformRegion.startsWith('oc') || platformRegion.startsWith('ph') || platformRegion.startsWith('sg') || platformRegion.startsWith('th') || platformRegion.startsWith('tw') || platformRegion.startsWith('vn') ? 'sea' :
                       'europe';
  
  // Fetch recent match IDs
  const matchIds = await riotAPI.getLeagueMatchIds(account.puuid, routingRegion, MATCHES_TO_CHECK);
  
  console.log(`[MatchSync] Found ${matchIds.length} recent League matches for ${account.gameName}#${account.tagLine}`);
  
  for (const matchId of matchIds) {
    // Check if already processed
    const [existing] = await db.select().from(processedRiotMatches).where(
      and(
        eq(processedRiotMatches.matchId, matchId),
        eq(processedRiotMatches.riotAccountId, account.id)
      )
    );
    
    if (existing) {
      continue; // Already processed this match
    }
    
    // Fetch match details
    const matchData = await riotAPI.getLeagueMatch(matchId, platformRegion);
    
    // Find this player's participation
    const participant = matchData.info.participants.find((p: any) => p.puuid === account.puuid);
    
    if (!participant) {
      console.warn(`[MatchSync] Player not found in match ${matchId}`);
      continue;
    }
    
    const didWin = participant.win;
    const gameEndedAt = new Date(matchData.info.gameEndTimestamp);
    
    // Award points if they won
    let pointsAwarded = 0;
    let transactionId: string | null = null;
    
    if (didWin) {
      try {
        const transaction = await pointsEngine.awardPoints(
          account.userId,
          10, // Base points for a League win
          'match_win',
          matchId,
          'riot_league',
          `League of Legends win (${participant.championName})`
        );
        
        pointsAwarded = transaction.amount;
        transactionId = transaction.id;
        
        console.log(`[MatchSync] ✓ Awarded ${pointsAwarded} points to ${account.gameName}#${account.tagLine} for League win`);
      } catch (error: any) {
        console.error(`[MatchSync] Failed to award points for match ${matchId}:`, error.message);
        // Still record the match as processed even if points failed
      }
    } else {
      console.log(`[MatchSync] - Match ${matchId} was a loss. No points awarded.`);
    }
    
    // Record as processed
    await db.insert(processedRiotMatches).values({
      riotAccountId: account.id,
      matchId,
      gameEndedAt,
      isWin: didWin,
      pointsAwarded,
      transactionId,
    });
  }
}

async function syncValorantAccount(account: typeof riotAccounts.$inferSelect) {
  const riotAPI = getRiotAPI();
  
  // Determine regional routing for Valorant
  const routingRegion = account.region.startsWith('na') || account.region.startsWith('br') || account.region.startsWith('latam') ? 'na' :
                       account.region.startsWith('eu') ? 'eu' :
                       account.region.startsWith('kr') ? 'kr' :
                       account.region.startsWith('ap') ? 'ap' : 'na';
  
  // Fetch recent match IDs
  const matchIds = await riotAPI.getValorantMatchIds(account.puuid, routingRegion, MATCHES_TO_CHECK);
  
  console.log(`[MatchSync] Found ${matchIds.length} recent Valorant matches for ${account.gameName}#${account.tagLine}`);
  
  for (const matchId of matchIds) {
    // Check if already processed
    const [existing] = await db.select().from(processedRiotMatches).where(
      and(
        eq(processedRiotMatches.matchId, matchId),
        eq(processedRiotMatches.riotAccountId, account.id)
      )
    );
    
    if (existing) {
      continue; // Already processed this match
    }
    
    // Fetch match details
    const matchData = await riotAPI.getValorantMatch(matchId, routingRegion);
    
    // Find this player's participation
    const participant = matchData.players.find((p: any) => p.puuid === account.puuid);
    
    if (!participant) {
      console.warn(`[MatchSync] Player not found in match ${matchId}`);
      continue;
    }
    
    const didWin = participant.won;
    const gameStartMillis = matchData.matchInfo?.gameStartMillis || Date.now();
    const gameLengthMillis = matchData.matchInfo?.gameLengthMillis || 0;
    const gameEndedAt = new Date(gameStartMillis + gameLengthMillis);
    
    // Award points if they won
    let pointsAwarded = 0;
    let transactionId: string | null = null;
    
    if (didWin) {
      try {
        const transaction = await pointsEngine.awardPoints(
          account.userId,
          10, // Base points for a Valorant win
          'match_win',
          matchId,
          'riot_valorant',
          `Valorant win (Agent: ${participant.characterId})`
        );
        
        pointsAwarded = transaction.amount;
        transactionId = transaction.id;
        
        console.log(`[MatchSync] ✓ Awarded ${pointsAwarded} points to ${account.gameName}#${account.tagLine} for Valorant win`);
      } catch (error: any) {
        console.error(`[MatchSync] Failed to award points for match ${matchId}:`, error.message);
        // Still record the match as processed even if points failed
      }
    } else {
      console.log(`[MatchSync] - Match ${matchId} was a loss. No points awarded.`);
    }
    
    // Record as processed
    await db.insert(processedRiotMatches).values({
      riotAccountId: account.id,
      matchId,
      gameEndedAt,
      isWin: didWin,
      pointsAwarded,
      transactionId,
    });
  }
}
