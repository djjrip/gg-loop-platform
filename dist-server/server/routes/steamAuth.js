import passport from "passport";
import { Strategy as SteamStrategy } from "passport-steam";
import { linkSteamAccount } from "../services/steam";
const STEAM_API_KEY = process.env.STEAM_API_KEY || 'DISABLED';
export function setupSteamAuth(app) {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    // Configure Strategy
    passport.use(new SteamStrategy({
        returnURL: `${baseUrl}/api/steam/return`,
        realm: `${baseUrl}/`,
        apiKey: STEAM_API_KEY,
        passReqToCallback: true // CRITICAL: Allows linking to existing session
    }, async (req, identifier, profile, done) => {
        try {
            // Ensure user is logged in
            if (!req.user) {
                // If strictly creating a new account via Steam is allowed, we'd handle it here.
                // But per specs, we are LINKING.
                return done(new Error("You must be logged in to link a Steam account."));
            }
            // Profile might be partial if API key is missing/cooldown
            // If API key is missing, profile.displayName might be undefined.
            // We ensure we at least have the ID.
            if (!profile.id) {
                // Fallback: extract from identifier URL if profile.id is missing
                const matches = identifier.match(/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/);
                if (matches && matches[1]) {
                    profile.id = matches[1];
                }
                else {
                    return done(new Error("Could not determine Steam ID"));
                }
            }
            // Link Account in DB
            // We pass the raw profile specific fields we need
            // If API key failed, 'profile._json' might be empty or missing. Use robust checking.
            const steamProfile = {
                id: profile.id,
                // Fallbacks for missing API key data
                displayName: profile.displayName || `Steam User ${profile.id.slice(-4)}`,
                _json: profile._json || {}
            };
            // If _json is missing properties, provide safe defaults
            if (!steamProfile._json.profileurl)
                steamProfile._json.profileurl = `https://steamcommunity.com/profiles/${profile.id}`;
            if (!steamProfile._json.avatar)
                steamProfile._json.avatar = null;
            await linkSteamAccount(req.user.id, steamProfile);
            // Return the ORIGINAL user to keep session intact
            return done(null, req.user);
        }
        catch (error) {
            return done(error);
        }
    }));
    // --- ROUTES ---
    // Init
    app.get('/api/steam/auth/init', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        passport.authenticate('steam')(req, res, next);
    });
    // Return
    app.get('/api/steam/return', passport.authenticate('steam', {
        failureRedirect: '/settings?error=steam_failed',
        successRedirect: '/settings?steam=connected'
    }));
    // Status (Backend Only for Verification)
    app.get('/api/steam/status', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { getSteamTrustSignals } = await import("../services/steam");
        const status = await getSteamTrustSignals(req.user.id);
        res.json(status);
    });
}
