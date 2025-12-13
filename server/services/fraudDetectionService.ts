/**
 * GG LOOP Fraud Detection Service
 * AI-powered fraud detection with risk scoring, pattern recognition, and automated flagging
 */

import { db } from '../db';
import { fraudDetectionLogs, matchSubmissions, users, verificationQueue } from '../../shared/schema';
import { verificationConfig } from '../config/verificationConfig';
import { eq, and, desc, sql, gte } from 'drizzle-orm';
import type { FraudDetectionType } from '../config/verificationConfig';

/**
 * Evaluate match for fraud
 * Computes 0-100 risk score based on multiple fraud signals
 */
export async function evaluateMatchForFraud(params: {
    matchSubmissionId: string;
    userId: string;
    matchData?: Record<string, any>;
    ipAddress?: string;
    deviceFingerprint?: string;
}): Promise<{
    riskScore: number;
    detectionTypes: FraudDetectionType[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    shouldFlag: boolean;
}> {
    const detectionTypes: FraudDetectionType[] = [];
    let riskScore = 0;

    // DETECTION 1: Duplicate Submission Check
    if (verificationConfig.fraud.sensitivity.duplicateSubmission.enabled) {
        const duplicateRisk = await checkDuplicateSubmissions(params.userId, params.matchSubmissionId);
        if (duplicateRisk > 0) {
            riskScore += duplicateRisk;
            detectionTypes.push('duplicate_submission');
        }
    }

    // DETECTION 2: Impossible Timing Check
    if (verificationConfig.fraud.sensitivity.impossibleTiming.enabled) {
        const timingRisk = await checkImpossibleTiming(params.userId);
        if (timingRisk > 0) {
            riskScore += timingRisk;
            detectionTypes.push('impossible_timing');
        }
    }

    // DETECTION 3: IP Mismatch Check
    if (verificationConfig.fraud.sensitivity.ipMismatch.enabled && params.ipAddress) {
        const ipRisk = await checkIPMismatch(params.userId, params.ipAddress);
        if (ipRisk > 0) {
            riskScore += ipRisk;
            detectionTypes.push('ip_mismatch');
        }
    }

    // DETECTION 4: Pattern Anomaly Check
    if (verificationConfig.fraud.sensitivity.patternAnomaly.enabled) {
        const patternRisk = await checkPatternAnomaly(params.userId, params.matchData);
        if (patternRisk > 0) {
            riskScore += patternRisk;
            detectionTypes.push('pattern_anomaly');
        }
    }

    // DETECTION 5: Account Age Check
    const accountAgeRisk = await checkAccountAge(params.userId);
    if (accountAgeRisk > 0) {
        riskScore += accountAgeRisk;
        detectionTypes.push('account_age_new');
    }

    // DETECTION 6: Rapid Progression Check
    const progressionRisk = await checkRapidProgression(params.userId);
    if (progressionRisk > 0) {
        riskScore += progressionRisk;
        detectionTypes.push('rapid_progression');
    }

    // Clamp risk score to 0-100
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Determine severity
    let severity: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= verificationConfig.fraud.riskThresholds.critical) {
        severity = 'critical';
    } else if (riskScore >= verificationConfig.fraud.riskThresholds.high) {
        severity = 'high';
    } else if (riskScore >= verificationConfig.fraud.riskThresholds.medium) {
        severity = 'medium';
    } else {
        severity = 'low';
    }

    // Should we flag this?
    const shouldFlag = riskScore >= verificationConfig.fraud.riskThresholds.medium;

    return {
        riskScore,
        detectionTypes,
        severity,
        shouldFlag
    };
}

/**
 * Check for duplicate submissions
 */
async function checkDuplicateSubmissions(userId: string, currentSubmissionId: string): Promise<number> {
    const timeWindow = verificationConfig.fraud.sensitivity.duplicateSubmission.timeWindowHours;
    const maxSubmissions = verificationConfig.fraud.sensitivity.duplicateSubmission.maxSubmissionsPerWindow;

    const windowStart = new Date(Date.now() - timeWindow * 60 * 60 * 1000);

    const recentSubmissions = await db
        .select()
        .from(matchSubmissions)
        .where(
            and(
                eq(matchSubmissions.userId, userId),
                gte(matchSubmissions.createdAt, windowStart)
            )
        );

    if (recentSubmissions.length > maxSubmissions) {
        // Exceeded submission limit
        const excessRatio = recentSubmissions.length / maxSubmissions;
        return Math.min(verificationConfig.fraud.flagWeights.duplicate_submission * excessRatio, 40);
    }

    return 0;
}

/**
 * Check for impossible timing (too many matches in short period)
 */
async function checkImpossibleTiming(userId: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const maxMatchesPerHour = verificationConfig.fraud.sensitivity.impossibleTiming.maxMatchesPerHour;

    const recentMatches = await db
        .select()
        .from(matchSubmissions)
        .where(
            and(
                eq(matchSubmissions.userId, userId),
                gte(matchSubmissions.createdAt, oneHourAgo)
            )
        );

    if (recentMatches.length > maxMatchesPerHour) {
        // Too many matches in one hour
        const excessRatio = recentMatches.length / maxMatchesPerHour;
        return Math.min(verificationConfig.fraud.flagWeights.impossible_timing * excessRatio, 50);
    }

    return 0;
}

/**
 * Check for IP address mismatches
 */
async function checkIPMismatch(userId: string, currentIP: string): Promise<number> {
    // Get recent fraud logs with IP data
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentLogs = await db
        .select()
        .from(fraudDetectionLogs)
        .where(
            and(
                eq(fraudDetectionLogs.userId, userId),
                gte(fraudDetectionLogs.createdAt, oneDayAgo)
            )
        );

    // Extract unique IPs from detection data
    const uniqueIPs = new Set<string>();
    recentLogs.forEach(log => {
        if (log.detectionData && typeof log.detectionData === 'object') {
            const data = log.detectionData as Record<string, any>;
            if (data.ipAddress) {
                uniqueIPs.add(data.ipAddress);
            }
        }
    });

    uniqueIPs.add(currentIP);

    const maxIPsPerDay = verificationConfig.fraud.sensitivity.ipMismatch.maxIPsPerDay;

    if (uniqueIPs.size > maxIPsPerDay) {
        // Too many different IPs
        const excessRatio = uniqueIPs.size / maxIPsPerDay;
        return Math.min(verificationConfig.fraud.flagWeights.ip_mismatch * excessRatio, 30);
    }

    return 0;
}

/**
 * Check for pattern anomalies (statistical outliers)
 */
async function checkPatternAnomaly(userId: string, matchData?: Record<string, any>): Promise<number> {
    const minHistoricalMatches = verificationConfig.fraud.sensitivity.patternAnomaly.minHistoricalMatches;

    const userMatches = await db
        .select()
        .from(matchSubmissions)
        .where(eq(matchSubmissions.userId, userId));

    if (userMatches.length < minHistoricalMatches) {
        // Not enough history to detect anomalies
        return 0;
    }

    // Check for statistical anomalies in match data
    // For now, simple heuristic: check if points awarded is unusually high
    if (matchData && matchData.pointsAwarded) {
        const historicalPoints = userMatches
            .filter(m => m.pointsAwarded !== null)
            .map(m => m.pointsAwarded as number);

        if (historicalPoints.length > 0) {
            const mean = historicalPoints.reduce((sum, p) => sum + p, 0) / historicalPoints.length;
            const variance = historicalPoints.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / historicalPoints.length;
            const stdDev = Math.sqrt(variance);

            const currentPoints = matchData.pointsAwarded;
            const deviations = Math.abs(currentPoints - mean) / (stdDev || 1);

            if (deviations > verificationConfig.fraud.sensitivity.patternAnomaly.deviationThreshold) {
                // Statistical outlier
                return Math.min(verificationConfig.fraud.flagWeights.pattern_anomaly, 30);
            }
        }
    }

    return 0;
}

/**
 * Check account age (new accounts are higher risk)
 */
async function checkAccountAge(userId: string): Promise<number> {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) return 0;

    const accountAgeDays = Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (accountAgeDays < 1) {
        return verificationConfig.fraud.flagWeights.account_age_new;
    } else if (accountAgeDays < 7) {
        return Math.floor(verificationConfig.fraud.flagWeights.account_age_new * 0.5);
    }

    return 0;
}

/**
 * Check for rapid progression (too many points too quickly)
 */
async function checkRapidProgression(userId: string): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentMatches = await db
        .select()
        .from(matchSubmissions)
        .where(
            and(
                eq(matchSubmissions.userId, userId),
                gte(matchSubmissions.createdAt, oneDayAgo)
            )
        );

    const totalPoints = recentMatches
        .filter(m => m.pointsAwarded !== null)
        .reduce((sum, m) => sum + (m.pointsAwarded as number), 0);

    const dailyLimit = verificationConfig.limits.points.maxPerDay;

    if (totalPoints > dailyLimit * 1.5) {
        // Exceeded daily limit by 50%
        return verificationConfig.fraud.flagWeights.rapid_progression;
    }

    return 0;
}

/**
 * Log fraud event
 */
export async function logFraudEvent(params: {
    userId: string;
    detectionType: FraudDetectionType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    sourceType: 'match_submission' | 'streaming_session' | 'challenge_completion';
    sourceId: string;
    detectionData: Record<string, any>;
    ipAddress?: string;
    deviceFingerprint?: string;
}): Promise<{ logId: string; shouldEnqueue: boolean }> {
    // Create fraud log
    const [log] = await db
        .insert(fraudDetectionLogs)
        .values({
            userId: params.userId,
            detectionType: params.detectionType,
            severity: params.severity,
            riskScore: params.riskScore,
            sourceType: params.sourceType,
            sourceId: params.sourceId,
            detectionData: params.detectionData,
            ipAddress: params.ipAddress || null,
            deviceFingerprint: params.deviceFingerprint || null,
            status: 'pending'
        })
        .returning();

    // Should we enqueue for manual review?
    const shouldEnqueue = params.severity === 'high' || params.severity === 'critical';

    if (shouldEnqueue) {
        // Create verification queue item
        await db
            .insert(verificationQueue)
            .values({
                itemType: 'fraud_alert',
                itemId: log.id,
                userId: params.userId,
                priority: params.severity === 'critical' ? 4 : 3,
                status: 'pending',
                dueBy: new Date(Date.now() + (params.severity === 'critical' ? 4 : 24) * 60 * 60 * 1000),
                queueMetadata: {
                    detectionType: params.detectionType,
                    riskScore: params.riskScore
                }
            });
    }

    return {
        logId: log.id,
        shouldEnqueue
    };
}

/**
 * Get active fraud alerts
 */
export async function getActiveFraudAlerts(filters?: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    limit?: number;
}): Promise<Array<{
    id: string;
    userId: string;
    detectionType: string;
    severity: string;
    riskScore: number;
    sourceType: string;
    sourceId: string;
    createdAt: Date;
    status: string;
}>> {
    let query = db
        .select()
        .from(fraudDetectionLogs)
        .where(eq(fraudDetectionLogs.status, 'pending'))
        .orderBy(desc(fraudDetectionLogs.riskScore), desc(fraudDetectionLogs.createdAt));

    if (filters?.severity) {
        query = query.where(
            and(
                eq(fraudDetectionLogs.status, 'pending'),
                eq(fraudDetectionLogs.severity, filters.severity)
            )
        ) as any;
    }

    if (filters?.userId) {
        query = query.where(
            and(
                eq(fraudDetectionLogs.status, 'pending'),
                eq(fraudDetectionLogs.userId, filters.userId)
            )
        ) as any;
    }

    if (filters?.limit) {
        query = query.limit(filters.limit) as any;
    }

    const alerts = await query;

    return alerts.map(alert => ({
        id: alert.id,
        userId: alert.userId,
        detectionType: alert.detectionType,
        severity: alert.severity,
        riskScore: alert.riskScore,
        sourceType: alert.sourceType,
        sourceId: alert.sourceId,
        createdAt: alert.createdAt,
        status: alert.status
    }));
}

/**
 * Resolve fraud alert
 */
export async function resolveFraudAlert(params: {
    logId: string;
    adminId: string;
    action: 'dismiss' | 'confirm' | 'escalate';
    actionTaken?: 'none' | 'warning' | 'points_reversed' | 'account_suspended';
    notes?: string;
}): Promise<{ success: boolean }> {
    await db
        .update(fraudDetectionLogs)
        .set({
            status: params.action === 'dismiss' ? 'dismissed' : params.action === 'confirm' ? 'confirmed' : 'reviewed',
            reviewedBy: params.adminId,
            reviewedAt: new Date(),
            actionTaken: params.actionTaken || 'none'
        })
        .where(eq(fraudDetectionLogs.id, params.logId));

    return { success: true };
}
