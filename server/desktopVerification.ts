// Desktop App Match Verification Route
// This endpoint receives match data from the desktop app and verifies it via Riot API

import { Request, Response } from 'express';
import { db } from '../db';
import { users, matches } from '../db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated, getUserMiddleware } from '../middleware';

/**
 * POST /api/desktop/verify-match
 * Verifies a completed match from the desktop app
 * 
 * Request body:
 * {
 *   matchId: string,      // Riot match ID
 *   gameType: 'valorant' | 'league',
 *   region: string,       // e.g., 'na1', 'americas'
 *   puuid: string         // Player's Riot PUUID
 * }
 */
export async function verifyDesktopMatch(req: Request, res: Response) {
    try {
        const { matchId, gameType, region, puuid } = req.body;
        const userId = (req as any).dbUser.id;

        // Validation
        if (!matchId || !gameType || !region || !puuid) {
            return res.status(400).json({
                message: 'Missing required fields: matchId, gameType, region, puuid'
            });
        }

        if (!['valorant', 'league'].includes(gameType)) {
            return res.status(400).json({
                message: 'Invalid gameType. Must be "valorant" or "league"'
            });
        }

        // Check if match already verified
        const existingMatch = await db
            .select()
            .from(matches)
            .where(eq(matches.matchId, matchId))
            .limit(1);

        if (existingMatch.length > 0) {
            return res.status(409).json({
                message: 'Match already verified',
                matchId
            });
        }

        // Verify with Riot API
        let matchData;
        if (gameType === 'valorant') {
            matchData = await verifyValorantMatch(matchId, region, puuid);
        } else {
            matchData = await verifyLeagueMatch(matchId, region, puuid);
        }

        if (!matchData.valid) {
            return res.status(400).json({
                message: 'Match verification failed',
                error: matchData.error
            });
        }

        // Calculate points (base implementation)
        const pointsEarned = calculateMatchPoints(matchData);

        // Store match in database
        await db.insert(matches).values({
            userId,
            matchId,
            gameType,
            region,
            puuid,
            result: matchData.result, // 'win' | 'loss'
            pointsEarned,
            verifiedAt: new Date(),
            verificationSource: 'desktop',
            matchData: JSON.stringify(matchData.details)
        });

        // Award points to user
        await db
            .update(users)
            .set({
                points: db.raw(`points + ${pointsEarned}`)
            })
            .where(eq(users.id, userId));

        return res.json({
            success: true,
            matchId,
            pointsEarned,
            result: matchData.result
        });

    } catch (error) {
        console.error('Desktop match verification error:', error);
        return res.status(500).json({
            message: 'Internal server error during match verification'
        });
    }
}

/**
 * Verify Valorant match via Riot API
 */
async function verifyValorantMatch(matchId: string, region: string, puuid: string) {
    const RIOT_API_KEY = process.env.RIOT_API_KEY;

    if (!RIOT_API_KEY) {
        return { valid: false, error: 'Riot API key not configured' };
    }

    try {
        const response = await fetch(
            `https://${region}.api.riotgames.com/val/match/v1/matches/${matchId}`,
            {
                headers: {
                    'X-Riot-Token': RIOT_API_KEY
                }
            }
        );

        if (!response.ok) {
            return {
                valid: false,
                error: `Riot API error: ${response.status}`
            };
        }

        const data = await response.json();

        // Find player in match
        const player = data.players.find((p: any) => p.puuid === puuid);

        if (!player) {
            return {
                valid: false,
                error: 'Player not found in match'
            };
        }

        return {
            valid: true,
            result: player.teamId === data.teams.find((t: any) => t.won)?.teamId ? 'win' : 'loss',
            details: {
                kills: player.stats.kills,
                deaths: player.stats.deaths,
                assists: player.stats.assists,
                agent: player.characterId,
                map: data.matchInfo.mapId,
                duration: data.matchInfo.gameLengthMillis
            }
        };

    } catch (error: any) {
        return {
            valid: false,
            error: error.message || 'Valorant API request failed'
        };
    }
}

/**
 * Verify League of Legends match via Riot API
 */
async function verifyLeagueMatch(matchId: string, region: string, puuid: string) {
    const RIOT_API_KEY = process.env.RIOT_API_KEY;

    if (!RIOT_API_KEY) {
        return { valid: false, error: 'Riot API key not configured' };
    }

    try {
        const response = await fetch(
            `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
            {
                headers: {
                    'X-Riot-Token': RIOT_API_KEY
                }
            }
        );

        if (!response.ok) {
            return {
                valid: false,
                error: `Riot API error: ${response.status}`
            };
        }

        const data = await response.json();

        // Find player in match
        const participantIndex = data.metadata.participants.indexOf(puuid);

        if (participantIndex === -1) {
            return {
                valid: false,
                error: 'Player not found in match'
            };
        }

        const participant = data.info.participants[participantIndex];

        return {
            valid: true,
            result: participant.win ? 'win' : 'loss',
            details: {
                kills: participant.kills,
                deaths: participant.deaths,
                assists: participant.assists,
                champion: participant.championName,
                role: participant.teamPosition,
                duration: data.info.gameDuration
            }
        };

    } catch (error: any) {
        return {
            valid: false,
            error: error.message || 'League API request failed'
        };
    }
}

/**
 * Calculate points earned from match
 * Base implementation - can be enhanced with tier multipliers, streaks, etc.
 */
function calculateMatchPoints(matchData: any): number {
    const BASE_POINTS = 100;
    const WIN_MULTIPLIER = 1.5;

    if (matchData.result === 'win') {
        return Math.floor(BASE_POINTS * WIN_MULTIPLIER);
    }

    return BASE_POINTS;
}
