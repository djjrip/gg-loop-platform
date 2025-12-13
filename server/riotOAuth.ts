/**
 * RIOT OAUTH (RSO - RIOT SIGN-ON)
 * Much better UX than manual username entry
 * Official Riot authentication flow
 */

import { Express, Request, Response } from 'express';

// Riot OAuth endpoints
const RIOT_OAUTH_URL = 'https://auth.riotgames.com/authorize';
const RIOT_TOKEN_URL = 'https://auth.riotgames.com/token';
const RIOT_USERINFO_URL = 'https://americas.api.riotgames.com/riot/account/v1/accounts/me';

export function setupRiotOAuth(app: Express) {

    // Step 1: Redirect to Riot OAuth
    app.get('/auth/riot', (req: Request, res: Response) => {
        const state = generateRandomState(); // CSRF protection
        req.session.riotOAuthState = state;

        const params = new URLSearchParams({
            client_id: process.env.RIOT_CLIENT_ID!,
            redirect_uri: `${process.env.BASE_URL}/auth/riot/callback`,
            response_type: 'code',
            scope: 'openid', // Basic scope gives us PUUID and account info
            state: state,
        });

        res.redirect(`${RIOT_OAUTH_URL}?${params.toString()}`);
    });

    // Step 2: Handle OAuth callback
    app.get('/auth/riot/callback', async (req: Request, res: Response) => {
        const { code, state } = req.query;

        // Verify state (CSRF protection)
        if (state !== req.session.riotOAuthState) {
            return res.redirect('/?error=invalid_state');
        }

        try {
            // Exchange code for access token
            const tokenResponse = await fetch(RIOT_TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(
                        `${process.env.RIOT_CLIENT_ID}:${process.env.RIOT_CLIENT_SECRET}`
                    ).toString('base64')}`,
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code as string,
                    redirect_uri: `${process.env.BASE_URL}/auth/riot/callback`,
                }),
            });

            const tokens = await tokenResponse.json();

            if (!tokenResponse.ok) {
                throw new Error('Failed to get access token');
            }

            // Get user info from Riot
            const userinfoResponse = await fetch(RIOT_USERINFO_URL, {
                headers: {
                    'Authorization': `Bearer ${tokens.access_token}`,
                },
            });

            const riotAccount = await userinfoResponse.json();

            /*
             * riotAccount contains:
             * {
             *   puuid: "unique-player-id",
             *   gameName: "PlayerName",
             *   tagLine: "NA1"
             * }
             */

            // Save to user's account
            if (req.user) {
                await db.update(users)
                    .set({
                        riotPuuid: riotAccount.puuid,
                        riotGameName: riotAccount.gameName,
                        riotTagLine: riotAccount.tagLine,
                        riotId: `${riotAccount.gameName}#${riotAccount.tagLine}`,
                    })
                    .where(eq(users.id, req.user.id));
            }

            // Success! Redirect to dashboard
            res.redirect('/dashboard?riot_connected=true');

        } catch (error) {
            console.error('Riot OAuth error:', error);
            res.redirect('/?error=riot_auth_failed');
        }
    });
}

function generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

/*
 * BENEFITS OF RIOT OAUTH:
 * 
 * 1. One-click auth (no typing username#TAG)
 * 2. More secure (official Riot flow)
 * 3. Gets PUUID automatically (needed for match tracking)
 * 4. Better UX (familiar OAuth flow)
 * 5. No typos in username/tag
 * 
 * SETUP REQUIRED:
 * 
 * 1. Register app with Riot Developer Portal
 * 2. Get RIOT_CLIENT_ID and RIOT_CLIENT_SECRET
 * 3. Add to .env:
 *    RIOT_CLIENT_ID=your_client_id
 *    RIOT_CLIENT_SECRET=your_client_secret
 * 4. Update redirect URI in Riot portal to:
 *    https://ggloop.io/auth/riot/callback
 * 
 * Then users just click "Connect Riot Account" → OAuth flow → Done!
 */
