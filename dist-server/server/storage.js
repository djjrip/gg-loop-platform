import { db } from "./database";
import { users, games, userGames, leaderboardEntries, achievements, rewards, userRewards, subscriptions, subscriptionEvents, pointTransactions, apiPartners, gamingEvents, matchSubmissions, referrals, checklistItems } from "@shared/schema";
import { eq, desc, and, sql, gte } from "drizzle-orm";
import { pointsEngine } from "./pointsEngine";
import { generateReferralCode } from "./lib/referral";
export class DbStorage {
    async getUser(id) {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return result[0];
    }
    async updateUserPoints(userId, points) {
        const [updatedUser] = await db
            .update(users)
            .set({
            totalPoints: sql `${users.totalPoints} + ${points}`,
        })
            .where(eq(users.id, userId))
            .returning();
        return updatedUser;
    }
    async getUserByOidcSub(oidcSub) {
        const result = await db.select().from(users).where(eq(users.oidcSub, oidcSub)).limit(1);
        return result[0];
    }
    async getUserByUsername(username) {
        const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
        return result[0];
    }
    async getUserByEmail(email) {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0];
    }
    async upsertUser(userData) {
        // LOG INPUTS (safe, no secrets)
        console.log('[Storage] upsertUser called:', {
            provider: userData.oidcSub?.split(':')[0],
            providerId: userData.oidcSub?.split(':')[1]?.substring(0, 8) + '...',
            email: userData.email ? `${userData.email.substring(0, 3)}***@${userData.email.split('@')[1]}` : 'none',
            hasFirstName: !!userData.firstName,
        });
        let referralCode;
        let codeExists = true;
        while (codeExists) {
            referralCode = generateReferralCode();
            const existing = await this.getUserByReferralCode(referralCode);
            codeExists = !!existing;
        }
        try {
            // Check if user exists by oidcSub
            const existingUser = userData.oidcSub ? await this.getUserByOidcSub(userData.oidcSub) : undefined;
            // If not found by oidcSub, check by email (for multi-provider support)
            const existingEmailUser = !existingUser && userData.email
                ? await this.getUserByEmail(userData.email)
                : undefined;
            // For new users only, use transaction to safely assign founder status
            if (!existingUser && !existingEmailUser) {
                console.log('[Storage] Creating new user');
                return db.transaction(async (tx) => {
                    // Get next founder number
                    const [lastFounder] = await tx
                        .select({ founderNumber: users.founderNumber })
                        .from(users)
                        .where(sql `${users.founderNumber} IS NOT NULL`)
                        .orderBy(sql `${users.founderNumber} DESC`)
                        .limit(1);
                    const nextFounderNumber = (lastFounder?.founderNumber || 0) + 1;
                    const isFounder = nextFounderNumber <= 100;
                    const founderNumber = isFounder ? nextFounderNumber : undefined;
                    const [user] = await tx
                        .insert(users)
                        .values({ ...userData, referralCode, isFounder, founderNumber })
                        .returning();
                    if (!user) {
                        throw new Error('User insert returned no rows');
                    }
                    console.log('[Storage] User created successfully:', { userId: user.id, isFounder, founderNumber });
                    // Award 1,000 bonus points to founders
                    if (isFounder && founderNumber) {
                        const { pointsEngine } = await import('./pointsEngine');
                        await pointsEngine.awardPoints(user.id, 1000, 'FOUNDER_BONUS', `founder-${founderNumber}`, 'signup', `Founder #${founderNumber} Bonus - Welcome to GG Loop!`, tx);
                        console.log(`🎉 Awarded 1,000 bonus points to Founder #${founderNumber}`);
                        // Send Discord notification for new founder
                        try {
                            const discordWebhookUrl = process.env.DISCORD_FOUNDER_WEBHOOK_URL;
                            if (discordWebhookUrl) {
                                const displayName = user.firstName
                                    ? `${user.firstName} ${user.lastName || ''}`.trim()
                                    : user.email?.split('@')[0] || 'New Member';
                                await fetch(discordWebhookUrl, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        embeds: [{
                                                title: `🏆 Founder #${founderNumber} Joined!`,
                                                description: `${displayName} just became Founder #${founderNumber} of GG Loop!`,
                                                color: 0xF59E0B, // Amber color
                                                fields: [
                                                    { name: 'Bonus Points', value: '1,000 pts', inline: true },
                                                    { name: 'Spots Remaining', value: `${100 - founderNumber}/100`, inline: true }
                                                ],
                                                timestamp: new Date().toISOString()
                                            }]
                                    })
                                });
                            }
                        }
                        catch (discordError) {
                            console.error('Discord notification failed:', discordError);
                        }
                    }
                    return user;
                });
            }
            // Existing user - return existing record directly
            const targetUser = existingUser || existingEmailUser;
            if (!targetUser) {
                throw new Error("Internal error: no user found despite existence check");
            }
            console.log('[Storage] Existing user found - returning directly (no update needed)');
            console.log('[Storage] User:', {
                id: targetUser.id?.substring(0, 8) + '...',
                oidcSub: targetUser.oidcSub,
                hasEmail: !!targetUser.email,
                hasCreatedAt: !!targetUser.createdAt,
            });
            return targetUser;
        }
        catch (error) {
            console.error('[Storage] upsertUser FAILED:', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                oidcSub: userData.oidcSub,
                email: userData.email,
            });
            throw error;
        }
    }
    async createUser(insertUser) {
        // If no ID provided (e.g., guest creation), provide a UUID to avoid DB default issues in SQLite dev
        if (!insertUser.id) {
            // eslint-disable-next-line no-param-reassign
            insertUser.id = crypto.randomUUID();
        }
        // Ensure createdAt and updatedAt are set when using SQLite (SQLite doesn't support NOW())
        if (!insertUser.createdAt) {
            // eslint-disable-next-line no-param-reassign
            insertUser.createdAt = new Date().toISOString();
        }
        if (!insertUser.updatedAt) {
            // eslint-disable-next-line no-param-reassign
            insertUser.updatedAt = new Date().toISOString();
        }
        console.log('[Storage] createUser id:', insertUser.id);
        // DEBUG: Log insertUser values to check types
        try {
            console.log('[Storage:DEBUG] insertUser', JSON.stringify(insertUser, (k, v) => {
                if (v instanceof Date)
                    return { __isDate: true, value: v.toISOString() };
                return v;
            }));
        }
        catch (err) {
            console.warn('[Storage:DEBUG] Failed to stringify insertUser', err);
        }
        // Ensure createdAt/updatedAt are explicitly set for SQLite (avoids "NOW()" SQL function errors)
        if (!insertUser.createdAt) {
            insertUser.createdAt = new Date().toISOString();
        }
        if (!insertUser.updatedAt) {
            insertUser.updatedAt = new Date().toISOString();
        }
        const result = await db.insert(users).values(insertUser).returning();
        return result[0];
    }
    async updateUsername(userId, username) {
        const [user] = await db
            .update(users)
            .set({ username, updatedAt: sql `NOW()` })
            .where(eq(users.id, userId))
            .returning();
        return user;
    }
    async connectTwitchAccount(oidcSub, twitchData) {
        const [user] = await db
            .update(users)
            .set({
            twitchId: twitchData.twitchId,
            twitchUsername: twitchData.twitchUsername,
            twitchAccessToken: twitchData.accessToken,
            twitchRefreshToken: twitchData.refreshToken,
            twitchConnectedAt: sql `NOW()`,
            updatedAt: sql `NOW()`,
        })
            .where(eq(users.oidcSub, oidcSub))
            .returning();
        return user;
    }
    async disconnectTwitchAccount(userId) {
        const [user] = await db
            .update(users)
            .set({
            twitchId: null,
            twitchUsername: null,
            twitchAccessToken: null,
            twitchRefreshToken: null,
            twitchConnectedAt: null,
            updatedAt: sql `NOW()`,
        })
            .where(eq(users.id, userId))
            .returning();
        return user;
    }
    async connectTiktokAccount(oidcSub, tiktokData) {
        const [user] = await db
            .update(users)
            .set({
            tiktokOpenId: tiktokData.openId,
            tiktokUnionId: tiktokData.unionId || null,
            tiktokUsername: tiktokData.username,
            tiktokAccessToken: tiktokData.accessToken,
            tiktokRefreshToken: tiktokData.refreshToken,
            tiktokConnectedAt: sql `NOW()`,
            updatedAt: sql `NOW()`,
        })
            .where(eq(users.oidcSub, oidcSub))
            .returning();
        return user;
    }
    async getAllGames() {
        return db.select().from(games).where(eq(games.isActive, true));
    }
    async getGame(id) {
        const result = await db.select().from(games).where(eq(games.id, id)).limit(1);
        return result[0];
    }
    async createGame(insertGame) {
        const result = await db.insert(games).values(insertGame).returning();
        return result[0];
    }
    async getUserGames(userId) {
        const result = await db
            .select()
            .from(userGames)
            .innerJoin(games, eq(userGames.gameId, games.id))
            .where(eq(userGames.userId, userId));
        return result.map((r) => ({ ...r.user_games, game: r.games }));
    }
    async connectUserGame(insertUserGame) {
        const result = await db.insert(userGames).values(insertUserGame).returning();
        await db.update(users)
            .set({ gamesConnected: sql `${users.gamesConnected} + 1` })
            .where(eq(users.id, insertUserGame.userId));
        return result[0];
    }
    async linkRiotAccount(userId, gameId, riotData) {
        const existing = await db.select().from(userGames)
            .where(and(eq(userGames.userId, userId), eq(userGames.gameId, gameId)))
            .limit(1);
        if (existing.length > 0) {
            // If switching to a different PUUID, clean up old leaderboard entries
            if (existing[0].riotPuuid && existing[0].riotPuuid !== riotData.puuid) {
                console.log(`[Storage] User ${userId} switching Riot account for game ${gameId}. Cleaning up leaderboard entries.`);
                const { leaderboardEntries } = await import('@shared/schema');
                await db.delete(leaderboardEntries).where(and(eq(leaderboardEntries.userId, userId), eq(leaderboardEntries.gameId, gameId)));
            }
            const [updated] = await db.update(userGames)
                .set({
                accountName: `${riotData.gameName}#${riotData.tagLine}`,
                riotPuuid: riotData.puuid,
                riotGameName: riotData.gameName,
                riotTagLine: riotData.tagLine,
                riotRegion: riotData.region,
                verifiedAt: sql `NOW()`,
            })
                .where(eq(userGames.id, existing[0].id))
                .returning();
            return updated;
        }
        const [created] = await db.insert(userGames)
            .values({
            userId,
            gameId,
            accountName: `${riotData.gameName}#${riotData.tagLine}`,
            riotPuuid: riotData.puuid,
            riotGameName: riotData.gameName,
            riotTagLine: riotData.tagLine,
            riotRegion: riotData.region,
            verifiedAt: sql `NOW()`,
        })
            .returning();
        await db.update(users)
            .set({ gamesConnected: sql `${users.gamesConnected} + 1` })
            .where(eq(users.id, userId));
        return created;
    }
    async getRiotAccount(userId, gameId) {
        const result = await db.select().from(userGames)
            .where(and(eq(userGames.userId, userId), eq(userGames.gameId, gameId), sql `${userGames.riotPuuid} IS NOT NULL`))
            .limit(1);
        return result[0];
    }
    async verifyRiotAccount(userId, gameId) {
        const account = await this.getRiotAccount(userId, gameId);
        return account !== undefined && account.riotPuuid !== null;
    }
    async getLeaderboard(gameId, period, limit = 10) {
        const result = await db
            .select()
            .from(leaderboardEntries)
            .innerJoin(users, eq(leaderboardEntries.userId, users.id))
            .where(and(eq(leaderboardEntries.gameId, gameId), eq(leaderboardEntries.period, period)))
            .orderBy(leaderboardEntries.rank)
            .limit(limit);
        return result.map((r) => ({ ...r.leaderboard_entries, user: r.users }));
    }
    async upsertLeaderboardEntry(entry) {
        const result = await db.insert(leaderboardEntries)
            .values(entry)
            .onConflictDoUpdate({
            target: [leaderboardEntries.userId, leaderboardEntries.gameId, leaderboardEntries.period],
            set: {
                score: entry.score,
                rank: entry.rank,
                updatedAt: sql `NOW()`,
            },
        })
            .returning();
        return result[0];
    }
    async getUserAchievements(userId, limit = 10) {
        const result = await db
            .select()
            .from(achievements)
            .innerJoin(games, eq(achievements.gameId, games.id))
            .where(eq(achievements.userId, userId))
            .orderBy(desc(achievements.achievedAt))
            .limit(limit);
        return result.map((r) => ({ ...r.achievements, game: r.games }));
    }
    async createAchievement(insertAchievement) {
        return await db.transaction(async (tx) => {
            const [achievement] = await tx.insert(achievements).values(insertAchievement).returning();
            await pointsEngine.awardPoints(insertAchievement.userId, insertAchievement.pointsAwarded, "ACHIEVEMENT", achievement.id, "achievement", insertAchievement.title, tx);
            return achievement;
        });
    }
    async getAllRewards() {
        return db.select().from(rewards).where(eq(rewards.inStock, true));
    }
    async getReward(id) {
        const result = await db.select().from(rewards).where(eq(rewards.id, id)).limit(1);
        return result[0];
    }
    async createReward(reward) {
        const [newReward] = await db.insert(rewards).values(reward).returning();
        return newReward;
    }
    async updateReward(rewardId, updates) {
        const [updatedReward] = await db
            .update(rewards)
            .set(updates)
            .where(eq(rewards.id, rewardId))
            .returning();
        if (!updatedReward) {
            throw new Error("Reward not found");
        }
        return updatedReward;
    }
    async deleteReward(rewardId) {
        await db
            .update(rewards)
            .set({ inStock: false })
            .where(eq(rewards.id, rewardId));
    }
    async getUserRewards(userId) {
        const result = await db
            .select()
            .from(userRewards)
            .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
            .where(eq(userRewards.userId, userId))
            .orderBy(desc(userRewards.redeemedAt));
        return result.map((r) => ({ ...r.user_rewards, reward: r.rewards }));
    }
    async getAllPendingRewards() {
        const result = await db
            .select()
            .from(userRewards)
            .innerJoin(rewards, eq(userRewards.rewardId, rewards.id))
            .innerJoin(users, eq(userRewards.userId, users.id))
            .where(eq(userRewards.status, "pending"))
            .orderBy(sql `CASE WHEN ${users.isFounder} = true THEN 0 ELSE 1 END`, // Founders first
        desc(userRewards.redeemedAt) // Then by redemption date
        );
        return result.map((r) => ({ ...r.user_rewards, reward: r.rewards, user: r.users }));
    }
    async updateUserRewardStatus(userRewardId, status, fulfillmentData) {
        const [userReward] = await db
            .update(userRewards)
            .set({
            status,
            fulfillmentData: fulfillmentData || null
        })
            .where(eq(userRewards.id, userRewardId))
            .returning();
        return userReward;
    }
    async redeemReward(insertUserReward) {
        return await db.transaction(async (tx) => {
            const reward = await tx.select().from(rewards).where(eq(rewards.id, insertUserReward.rewardId)).limit(1).for("update");
            if (!reward[0]) {
                throw new Error("Reward not found");
            }
            if (!reward[0].inStock) {
                throw new Error("Reward is out of stock");
            }
            if (reward[0].stock !== null && reward[0].stock <= 0) {
                throw new Error("Reward is out of stock");
            }
            await pointsEngine.spendPoints(insertUserReward.userId, insertUserReward.pointsSpent, "REWARD_REDEMPTION", reward[0].id, "reward", `Redeemed: ${reward[0].title}`, tx);
            const [userReward] = await tx.insert(userRewards).values(insertUserReward).returning();
            if (reward[0].stock !== null) {
                await tx
                    .update(rewards)
                    .set({
                    stock: sql `${rewards.stock} - 1`,
                    inStock: sql `${rewards.stock} > 1`
                })
                    .where(eq(rewards.id, reward[0].id));
            }
            return userReward;
        });
    }
    async getSubscription(userId) {
        const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
        return result[0];
    }
    async createSubscription(insertSubscription) {
        const [subscription] = await db.insert(subscriptions).values(insertSubscription).returning();
        return subscription;
    }
    async updateSubscription(subscriptionId, updates) {
        const [subscription] = await db
            .update(subscriptions)
            .set({ ...updates, updatedAt: sql `NOW()` })
            .where(eq(subscriptions.id, subscriptionId))
            .returning();
        return subscription;
    }
    async logSubscriptionEvent(insertEvent) {
        const [event] = await db.insert(subscriptionEvents).values(insertEvent).returning();
        return event;
    }
    async getPointTransactions(userId, limit = 50) {
        return pointsEngine.getTransactionHistory(userId, limit);
    }
    async checkEventProcessed(eventId) {
        // Check if an event with this ID has already been processed by looking in eventData
        const result = await db
            .select()
            .from(subscriptionEvents)
            .where(sql `${subscriptionEvents.eventData}->>'eventId' = ${eventId}`)
            .limit(1);
        return result.length > 0;
    }
    async getApiPartner(apiKey) {
        const result = await db.select().from(apiPartners).where(eq(apiPartners.apiKey, apiKey)).limit(1);
        return result[0];
    }
    async createApiPartner(partner) {
        const [newPartner] = await db
            .insert(apiPartners)
            .values(partner)
            .returning();
        return newPartner;
    }
    async updateApiPartner(partnerId, updates) {
        const [partner] = await db
            .update(apiPartners)
            .set({ ...updates, updatedAt: sql `NOW()` })
            .where(eq(apiPartners.id, partnerId))
            .returning();
        return partner;
    }
    async logGamingEvent(event) {
        const [gamingEvent] = await db.insert(gamingEvents).values(event).returning();
        return gamingEvent;
    }
    async updateGamingEvent(eventId, updates) {
        const [event] = await db
            .update(gamingEvents)
            .set(updates)
            .where(eq(gamingEvents.id, eventId))
            .returning();
        return event;
    }
    async getEventByExternalId(partnerId, externalEventId) {
        const result = await db
            .select()
            .from(gamingEvents)
            .where(and(eq(gamingEvents.partnerId, partnerId), eq(gamingEvents.externalEventId, externalEventId)))
            .limit(1);
        return result[0];
    }
    async getUserMatchSubmissions(userId) {
        const result = await db
            .select({
            matchSubmission: matchSubmissions,
            game: games,
        })
            .from(matchSubmissions)
            .innerJoin(games, eq(matchSubmissions.gameId, games.id))
            .where(eq(matchSubmissions.userId, userId))
            .orderBy(desc(matchSubmissions.submittedAt));
        return result.map((row) => ({
            ...row.matchSubmission,
            game: row.game,
            gameName: row.game.title,
        }));
    }
    async createMatchSubmission(submission) {
        const [newSubmission] = await db
            .insert(matchSubmissions)
            .values(submission)
            .returning();
        return newSubmission;
    }
    async updateMatchSubmission(submissionId, updates) {
        const [submission] = await db
            .update(matchSubmissions)
            .set(updates)
            .where(eq(matchSubmissions.id, submissionId))
            .returning();
        return submission;
    }
    async getMatchSubmissionByRiotMatchId(userId, riotMatchId) {
        const result = await db
            .select()
            .from(matchSubmissions)
            .where(and(eq(matchSubmissions.userId, userId), eq(matchSubmissions.riotMatchId, riotMatchId)))
            .limit(1);
        return result[0];
    }
    async getUserByReferralCode(referralCode) {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.referralCode, referralCode))
            .limit(1);
        return result[0];
    }
    async createReferral(referral) {
        const [newReferral] = await db.insert(referrals).values(referral).returning();
        return newReferral;
    }
    async getReferralsByReferrer(referrerId) {
        const result = await db
            .select({
            referral: referrals,
            referredUser: users,
        })
            .from(referrals)
            .innerJoin(users, eq(referrals.referredUserId, users.id))
            .where(eq(referrals.referrerId, referrerId))
            .orderBy(desc(referrals.createdAt));
        return result.map((row) => ({
            ...row.referral,
            referredUser: row.referredUser,
        }));
    }
    async getReferralByUsers(referrerId, referredUserId) {
        const result = await db
            .select()
            .from(referrals)
            .where(and(eq(referrals.referrerId, referrerId), eq(referrals.referredUserId, referredUserId)))
            .limit(1);
        return result[0];
    }
    async updateReferral(referralId, updates) {
        const [referral] = await db
            .update(referrals)
            .set(updates)
            .where(eq(referrals.id, referralId))
            .returning();
        return referral;
    }
    async getReferralLeaderboard(limit = 50) {
        const result = await db
            .select({
            user: users,
            referralCount: sql `COUNT(${referrals.id})::int`,
            totalPoints: sql `COALESCE(SUM(${referrals.pointsAwarded}), 0)::int`,
        })
            .from(users)
            .leftJoin(referrals, eq(users.id, referrals.referrerId))
            .groupBy(users.id)
            .having(sql `COUNT(${referrals.id}) > 0`)
            .orderBy(desc(sql `COUNT(${referrals.id})`))
            .limit(limit);
        return result;
    }
    async startFreeTrial(userId) {
        const [user] = await db
            .update(users)
            .set({
            freeTrialStartedAt: sql `NOW()`,
            freeTrialEndsAt: sql `NOW() + INTERVAL '7 days'`,
            updatedAt: sql `NOW()`,
        })
            .where(eq(users.id, userId))
            .returning();
        return user;
    }
    async getDailyMetrics() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        // Get all subscriptions
        const allSubs = await db.select().from(subscriptions).where(eq(subscriptions.status, 'active'));
        // Calculate MRR and tier breakdown
        const tierPrices = { basic: 500, pro: 1200, elite: 2500 };
        let mrrTotal = 0;
        const activeSubscribers = { basic: 0, pro: 0, elite: 0, total: 0 };
        allSubs.forEach(sub => {
            const tier = sub.tier;
            mrrTotal += tierPrices[tier] || 0;
            activeSubscribers[tier]++;
            activeSubscribers.total++;
        });
        // Get subscription events for revenue calculation
        const revenueToday = await db
            .select({ total: sql `COALESCE(SUM(CASE WHEN type = 'payment_succeeded' THEN amount ELSE 0 END), 0)` })
            .from(subscriptionEvents)
            .where(gte(subscriptionEvents.createdAt, todayStart));
        const revenueThisWeek = await db
            .select({ total: sql `COALESCE(SUM(CASE WHEN type = 'payment_succeeded' THEN amount ELSE 0 END), 0)` })
            .from(subscriptionEvents)
            .where(gte(subscriptionEvents.createdAt, weekStart));
        const revenueThisMonth = await db
            .select({ total: sql `COALESCE(SUM(CASE WHEN type = 'payment_succeeded' THEN amount ELSE 0 END), 0)` })
            .from(subscriptionEvents)
            .where(gte(subscriptionEvents.createdAt, monthStart));
        // Get fulfillment metrics
        const pendingRewards = await db
            .select({
            count: sql `COUNT(*)::int`,
            value: sql `COALESCE(SUM(points_spent), 0)::int`
        })
            .from(userRewards)
            .where(eq(userRewards.status, 'pending'));
        const fulfilledToday = await db
            .select({ count: sql `COUNT(*)::int` })
            .from(userRewards)
            .where(and(eq(userRewards.status, 'fulfilled'), gte(userRewards.fulfilledAt, todayStart)));
        // Get user activity
        const totalUsersResult = await db.select({ count: sql `COUNT(*)::int` }).from(users);
        const newSignupsTodayResult = await db
            .select({ count: sql `COUNT(*)::int` })
            .from(users)
            .where(gte(users.createdAt, todayStart));
        const newSignupsWeekResult = await db
            .select({ count: sql `COUNT(*)::int` })
            .from(users)
            .where(gte(users.createdAt, weekStart));
        // Get active earners (users who earned points)
        const activeEarnersTodayResult = await db
            .select({ count: sql `COUNT(DISTINCT user_id)::int` })
            .from(pointTransactions)
            .where(and(gte(pointTransactions.createdAt, todayStart), sql `amount > 0`));
        const activeEarnersWeekResult = await db
            .select({ count: sql `COUNT(DISTINCT user_id)::int` })
            .from(pointTransactions)
            .where(and(gte(pointTransactions.createdAt, weekStart), sql `amount > 0`));
        // Get points economy
        const pointsIssuedResult = await db
            .select({ total: sql `COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0)::int` })
            .from(pointTransactions);
        const pointsRedeemedResult = await db
            .select({ total: sql `COALESCE(SUM(points_spent), 0)::int` })
            .from(userRewards);
        const totalPointsIssued = pointsIssuedResult[0]?.total || 0;
        const totalPointsRedeemed = pointsRedeemedResult[0]?.total || 0;
        return {
            mrrTotal,
            revenueToday: revenueToday[0]?.total || 0,
            revenueThisWeek: revenueThisWeek[0]?.total || 0,
            revenueThisMonth: revenueThisMonth[0]?.total || 0,
            activeSubscribers,
            pendingFulfillments: pendingRewards[0]?.count || 0,
            pendingValue: pendingRewards[0]?.value || 0,
            fulfilledToday: fulfilledToday[0]?.count || 0,
            totalUsers: totalUsersResult[0]?.count || 0,
            newSignupsToday: newSignupsTodayResult[0]?.count || 0,
            newSignupsThisWeek: newSignupsWeekResult[0]?.count || 0,
            activeEarnersToday: activeEarnersTodayResult[0]?.count || 0,
            activeEarnersThisWeek: activeEarnersWeekResult[0]?.count || 0,
            totalPointsIssued,
            totalPointsRedeemed,
            pointsLiability: totalPointsIssued - totalPointsRedeemed,
        };
    }
    async getChecklistItems(date) {
        return db.select().from(checklistItems).where(eq(checklistItems.date, date));
    }
    async upsertChecklistItem(item) {
        const existing = await db
            .select()
            .from(checklistItems)
            .where(and(eq(checklistItems.date, item.date), eq(checklistItems.taskId, item.taskId)))
            .limit(1);
        if (existing.length > 0) {
            const [updated] = await db
                .update(checklistItems)
                .set({ ...item, completedAt: item.completed ? sql `NOW()` : null })
                .where(eq(checklistItems.id, existing[0].id))
                .returning();
            return updated;
        }
        const [created] = await db.insert(checklistItems).values(item).returning();
        return created;
    }
    async toggleChecklistItem(date, taskId, taskLabel, completed) {
        const existing = await db
            .select()
            .from(checklistItems)
            .where(and(eq(checklistItems.date, date), eq(checklistItems.taskId, taskId)))
            .limit(1);
        if (existing.length > 0) {
            const [updated] = await db
                .update(checklistItems)
                .set({ completed, completedAt: completed ? sql `NOW()` : null })
                .where(eq(checklistItems.id, existing[0].id))
                .returning();
            return updated;
        }
        const [created] = await db
            .insert(checklistItems)
            .values({ date, taskId, taskLabel, completed, completedAt: completed ? sql `NOW()` : null })
            .returning();
        return created;
    }
}
export const storage = new DbStorage();
