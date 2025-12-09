// SECURE Riot Account Verification Endpoints
// Replaces the insecure /api/riot/link-account endpoint
// Implements 2-step ownership verification

import { Router } from 'express';
import { db } from '../db';
import { sql, and, eq, gt } from 'drizzle-orm';

const router = Router();

// Helper to generate 6-character verification code
function generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Helper to get routing region from user input
function getRoutingRegion(region: string): string {
    const regionMap: Record<string, string> = {
        'na': 'americas', 'na1': 'americas', 'br': 'americas', 'br1': 'americas',
        'la1': 'americas', 'la2': 'americas', 'latam': 'americas',
        'eu': 'europe', 'euw': 'europe', 'euw1': 'europe', 'eun1': 'europe',
        'tr1': 'europe', 're': 'europe',
        'kr': 'asia', 'jp1': 'asia',
        'oc1': 'sea', 'ph2': 'sea', 'sg2': 'sea', 'th2': 'sea', 'tw2': 'sea', 'vn2': 'sea'
    };
    return regionMap[region.toLowerCase().trim()] || 'americas';
}

// Step 1: Request verification code
router.post('/request-verification', async (req: any, res) => {
    try {
        const userId = req.dbUser.id;
        const { game, gameName, tagLine, region = 'na' } = req.body;

        if (!game || !gameName || !tagLine) {
            return res.status(400).json({
                message: 'Game, gameName, and tagLine are required'
            });
        }

        // Generate unique verification code
        const verificationCode = generateVerificationCode();
        const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

        // Store verification request
        await db.run(sql`
      INSERT INTO riot_verifications (user_id, game, game_name, tag_line, region, verification_code, expires_at)
      VALUES (${userId}, ${game}, ${gameName}, ${tagLine}, ${region}, ${verificationCode}, ${expiresAt})
      ON CONFLICT (user_id, game) DO UPDATE SET
        game_name = ${gameName},
        tag_line = ${tagLine},
        region = ${region},
        verification_code = ${verificationCode},
        expires_at = ${expiresAt},
        created_at = strftime('%s', 'now')
    `);

        res.json({
            verificationCode,
            expiresIn: 600, // seconds
            instructions: game === 'valorant'
                ? `Add "${verificationCode}" to your Riot ID (in-game Settings → Riot ID → Change) then click "Verify Ownership"`
                : `Add "${verificationCode}" to your League summoner name, then click "Verify Ownership"`,
            note: 'The code will expire in 10 minutes'
        });
    } catch (error: any) {
        console.error('Error generating verification code:', error);
        res.status(500).json({ message: 'Failed to generate verification code' });
    }
});

// Step 2: Verify ownership
router.post('/verify-ownership', async (req: any, res) => {
    try {
        const userId = req.dbUser.id;
        const { game } = req.body;

        if (!game) {
            return res.status(400).json({ message: 'Game is required' });
        }

        // Get pending verification
        const verification = await db.get(sql`
      SELECT * FROM riot_verifications
      WHERE user_id = ${userId}
        AND game = ${game}
        AND expires_at > ${Date.now()}
      LIMIT 1
    `);

        if (!verification) {
            return res.status(404).json({
                message: 'No pending verification found or code expired. Please request a new code.'
            });
        }

        // Fetch account from Riot API
        const { getRiotAPI } = await import('../lib/riot');
        const riotAPI = getRiotAPI();
        const routingRegion = getRoutingRegion(verification.region);

        const riotAccount = await riotAPI.getAccountByRiotId(
            verification.game_name,
            verification.tag_line,
            routingRegion
        );

        // Check if verification code is in the account name
        const accountName = riotAccount.gameName || '';
        if (!accountName.toUpperCase().includes(verification.verification_code)) {
            return res.status(403).json({
                success: false,
                message: `Verification failed. We found your account "${accountName}" but it doesn't contain the code "${verification.verification_code}". Please add the code to your Riot ID and try again.`,
                currentName: accountName,
                expectedCode: verification.verification_code
            });
        }

        // SUCCESS - Link the account
        await db.run(sql`
      INSERT INTO riot_accounts (user_id, puuid, gameName, tagLine, region, game, verified)
      VALUES (${userId}, ${riotAccount.puuid}, ${verification.game_name}, ${verification.tag_line}, ${verification.region}, ${game}, 1)
      ON CONFLICT (user_id, game) DO UPDATE SET
        puuid = ${riotAccount.puuid},
        gameName = ${verification.game_name},
        tagLine = ${verification.tag_line},
        region = ${verification.region},
        verified = 1,
        updated_at = strftime('%s', 'now')
    `);

        // Clean up verification record
        await db.run(sql`DELETE FROM riot_verifications WHERE id = ${verification.id}`);

        res.json({
            success: true,
            message: 'Account verified and linked successfully!',
            account: {
                gameName: verification.game_name,
                tagLine: verification.tag_line,
                region: verification.region,
                verified: true
            }
        });
    } catch (error: any) {
        console.error('Error verifying ownership:', error);
        res.status(500).json({
            message: error.message || 'Failed to verify ownership'
        });
    }
});

// Get verification status (for UI polling)
router.get('/verification-status/:game', async (req: any, res) => {
    try {
        const userId = req.dbUser.id;
        const { game } = req.params;

        const verification = await db.get(sql`
      SELECT verification_code, expires_at, created_at
      FROM riot_verifications
      WHERE user_id = ${userId}
        AND game = ${game}
        AND expires_at > ${Date.now()}
      LIMIT 1
    `);

        if (!verification) {
            return res.json({ hasPending: false });
        }

        const timeRemaining = Math.floor((verification.expires_at - Date.now()) / 1000);

        res.json({
            hasPending: true,
            verificationCode: verification.verification_code,
            expiresIn: timeRemaining
        });
    } catch (error: any) {
        console.error('Error checking verification status:', error);
        res.status(500).json({ message: 'Failed to check status' });
    }
});

export default router;
