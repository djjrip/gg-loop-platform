/**
 * GG LOOP Verification Service
 * Core service for handling gameplay verification, proof validation, and fraud detection integration
 */

import { db } from '../database';
import { verificationProofs, fraudDetectionLogs, verificationQueue, matchSubmissions, users } from '../../shared/schema';
import { verificationConfig } from '../config/verificationConfig';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { VerificationMethod, QueuePriority } from '../config/verificationConfig';
import { TrustScoreService } from './trustScoreService';

/**
 * Verify a match submission
 * Cross-references with Riot API, computes verification score, decides on auto-approval or manual review
 */
export async function verifyMatchSubmission(matchSubmissionId: string): Promise<{
    verificationScore: number;
    verificationMethod: VerificationMethod;
    shouldAutoApprove: boolean;
    fraudFlags: string[];
}> {
    // Get match submission
    const [submission] = await db
        .select()
        .from(matchSubmissions)
        .where(eq(matchSubmissions.id, matchSubmissionId))
        .limit(1);

    if (!submission) {
        throw new Error(`Match submission ${matchSubmissionId} not found`);
    }

    // Initialize scores and flags
    let verificationScore = 0;
    const fraudFlags: string[] = [];

    // STEP 1: Check Riot API verification
    if (submission.verifiedViaRiot && submission.riotMatchId) {
        verificationScore += verificationConfig.scoring.baseScores.riotApiMatch;
    } else {
        verificationScore += verificationConfig.scoring.baseScores.proofWithoutMetadata;
        fraudFlags.push('no_riot_verification');
    }

    // STEP 2: Check proof quality
    const proofs = await db
        .select()
        .from(verificationProofs)
        .where(
            and(
                eq(verificationProofs.sourceType, 'match_submission'),
                eq(verificationProofs.sourceId, matchSubmissionId)
            )
        );

    if (proofs.length > 0) {
        // Has proof - add score
        const hasMetadata = proofs.some(p => p.fileMetadata !== null);
        if (hasMetadata) {
            verificationScore += verificationConfig.scoring.modifiers.proofQuality.highRes;
        } else {
            verificationScore += verificationConfig.scoring.modifiers.proofQuality.noExif;
        }
    }

    // STEP 3: Check account age
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, submission.userId))
        .limit(1);

    if (user) {
        const accountAgeDays = Math.floor(
            (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (accountAgeDays < 7) {
            verificationScore += verificationConfig.scoring.modifiers.accountAge.under7Days;
            fraudFlags.push('account_age_new');
        } else if (accountAgeDays > 90) {
            verificationScore += verificationConfig.scoring.modifiers.accountAge.over90Days;
        }
    }

    // STEP 4: Check historical accuracy
    const userSubmissions = await db
        .select()
        .from(matchSubmissions)
        .where(eq(matchSubmissions.userId, submission.userId));

    if (userSubmissions.length >= verificationConfig.autoApproval.criteria.minHistoricalMatches) {
        const verifiedCount = userSubmissions.filter(s => s.verifiedViaRiot).length;
        const accuracyPercent = (verifiedCount / userSubmissions.length) * 100;

        if (accuracyPercent > 95) {
            verificationScore += verificationConfig.scoring.modifiers.historicalAccuracy.over95Percent;
        } else if (accuracyPercent < 80) {
            verificationScore += verificationConfig.scoring.modifiers.historicalAccuracy.under80Percent;
            fraudFlags.push('low_historical_accuracy');
        }
    }

    // Clamp score to 0-100
    verificationScore = Math.max(0, Math.min(100, verificationScore));

    // STEP 5: Determine verification method and auto-approval
    let verificationMethod: VerificationMethod = 'pending';
    let shouldAutoApprove = false;

    if (verificationConfig.autoApproval.enabled && !verificationConfig.autoApproval.shadowMode) {
        // Check auto-approval criteria
        const meetsRiskThreshold = verificationScore >= verificationConfig.autoApproval.criteria.minVerificationScore;
        const hasRiotMatch = submission.verifiedViaRiot || !verificationConfig.autoApproval.criteria.requireRiotApiMatch;
        const hasEnoughHistory = userSubmissions.length >= verificationConfig.autoApproval.criteria.minHistoricalMatches;

        if (meetsRiskThreshold && hasRiotMatch && hasEnoughHistory) {
            verificationMethod = 'auto';
            shouldAutoApprove = true;
        } else {
            verificationMethod = 'manual';
        }
    } else {
        // Shadow mode or auto-approval disabled
        verificationMethod = 'manual';
    }

    // Update match submission
    await db
        .update(matchSubmissions)
        .set({
            verificationScore,
            fraudFlags: fraudFlags.length > 0 ? fraudFlags : null,
            verificationMethod
        })
        .where(eq(matchSubmissions.id, matchSubmissionId));

    return {
        verificationScore,
        verificationMethod,
        shouldAutoApprove,
        fraudFlags
    };
}

/**
 * Handle proof file upload
 * Stores proof metadata and triggers verification
 */
export async function handleProofUpload(params: {
    userId: string;
    sourceType: 'match_submission' | 'streaming_session' | 'challenge_completion';
    sourceId: string;
    fileUrl: string;
    fileType: 'image' | 'video' | 'replay';
    fileSizeBytes: number;
    fileMetadata?: Record<string, any>;
    notes?: string;
}): Promise<{ proofId: string; shouldEnqueue: boolean }> {
    // Validate file size
    const maxSizeBytes = verificationConfig.proof.upload.maxFileSizeMB * 1024 * 1024;
    if (params.fileSizeBytes > maxSizeBytes) {
        throw new Error(`File size exceeds maximum of ${verificationConfig.proof.upload.maxFileSizeMB}MB`);
    }

    // Create proof record
    const [proof] = await db
        .insert(verificationProofs)
        .values({
            userId: params.userId,
            sourceType: params.sourceType,
            sourceId: params.sourceId,
            fileUrl: params.fileUrl,
            fileType: params.fileType,
            fileSizeBytes: params.fileSizeBytes,
            fileMetadata: params.fileMetadata || null,
            uploadNotes: params.notes || null,
            status: 'pending'
        })
        .returning();

    // Check if we should enqueue for manual review
    const shouldEnqueue = !verificationConfig.autoApproval.enabled ||
        verificationConfig.autoApproval.shadowMode ||
        !params.fileMetadata; // No metadata = suspicious

    if (shouldEnqueue && params.sourceType === 'match_submission') {
        // Enqueue for manual review
        await enqueueVerificationItem({
            itemType: 'proof_review',
            itemId: proof.id,
            userId: params.userId,
            priority: params.fileMetadata ? 1 : 3 // Higher priority if no metadata
        });
    }

    return {
        proofId: proof.id,
        shouldEnqueue
    };
}

/**
 * Enqueue item for manual verification
 */
export async function enqueueVerificationItem(params: {
    itemType: 'match_submission' | 'fraud_alert' | 'proof_review';
    itemId: string;
    userId: string;
    priority?: QueuePriority;
    metadata?: Record<string, any>;
}): Promise<{ queueId: string }> {
    // Determine priority
    let priority: QueuePriority = params.priority || 1;

    // Check for existing queue item
    const existing = await db
        .select()
        .from(verificationQueue)
        .where(
            and(
                eq(verificationQueue.itemType, params.itemType),
                eq(verificationQueue.itemId, params.itemId)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        // Already in queue
        return { queueId: existing[0].id };
    }

    // Calculate SLA deadline based on priority
    const slaHours = verificationConfig.queue.sla[
        priority === 4 ? 'critical' :
            priority === 3 ? 'high' :
                priority === 2 ? 'medium' : 'low'
    ];
    const dueBy = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    // Create queue item
    const [queueItem] = await db
        .insert(verificationQueue)
        .values({
            itemType: params.itemType,
            itemId: params.itemId,
            userId: params.userId,
            priority,
            status: 'pending',
            dueBy,
            queueMetadata: params.metadata || null
        })
        .returning();

    return { queueId: queueItem.id };
}

/**
 * Get verification status for a user
 */
export async function getVerificationStatusForUser(userId: string): Promise<{
    pendingReviews: number;
    approvedCount: number;
    rejectedCount: number;
    totalVerificationScore: number;
    activeFraudFlags: string[];
}> {
    // Get pending queue items
    const pendingItems = await db
        .select()
        .from(verificationQueue)
        .where(
            and(
                eq(verificationQueue.userId, userId),
                eq(verificationQueue.status, 'pending')
            )
        );

    // Get match submissions
    const submissions = await db
        .select()
        .from(matchSubmissions)
        .where(eq(matchSubmissions.userId, userId));

    const approvedCount = submissions.filter(s => s.status === 'approved').length;
    const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

    // Calculate average verification score
    const scoresWithValues = submissions.filter(s => s.verificationScore !== null);
    const totalVerificationScore = scoresWithValues.length > 0
        ? Math.round(scoresWithValues.reduce((sum, s) => sum + (s.verificationScore || 0), 0) / scoresWithValues.length)
        : 0;

    // Get active fraud flags
    const activeFraudFlags: string[] = [];
    submissions.forEach(s => {
        if (s.fraudFlags && Array.isArray(s.fraudFlags)) {
            activeFraudFlags.push(...(s.fraudFlags as string[]));
        }
    });

    return {
        pendingReviews: pendingItems.length,
        approvedCount,
        rejectedCount,
        totalVerificationScore,
        activeFraudFlags: [...new Set(activeFraudFlags)] // Unique flags
    };
}

/**
 * Process admin review decision
 */
export async function processAdminReview(params: {
    queueId: string;
    adminId: string;
    action: 'approve' | 'reject' | 'flag';
    notes?: string;
    fraudFlags?: string[];
}): Promise<{ success: boolean }> {
    // Get queue item
    const [queueItem] = await db
        .select()
        .from(verificationQueue)
        .where(eq(verificationQueue.id, params.queueId))
        .limit(1);

    if (!queueItem) {
        throw new Error(`Queue item ${params.queueId} not found`);
    }

    // Update queue item
    await db
        .update(verificationQueue)
        .set({
            status: 'completed',
            assignedTo: params.adminId,
            completedAt: new Date()
        })
        .where(eq(verificationQueue.id, params.queueId));

    // Update source item based on type
    if (queueItem.itemType === 'match_submission') {
        const newStatus = params.action === 'approve' ? 'approved' : 'rejected';
        await db
            .update(matchSubmissions)
            .set({
                status: newStatus,
                reviewedBy: params.adminId,
                reviewedAt: new Date(),
                fraudFlags: params.fraudFlags || null,
                verificationMethod: 'manual'
            })
            .where(eq(matchSubmissions.id, queueItem.itemId));

        // Trust Score Event
        if (newStatus === 'approved') {
            await TrustScoreService.logEvent(
                queueItem.userId,
                'MATCH_VERIFIED_MANUAL',
                1, // Value depends on scoring logic, but logEvent will trigger recalc
                `Match ${queueItem.itemId} manually verified by admin`,
                'admin_review'
            );
        }
    } else if (queueItem.itemType === 'proof_review') {
        const newStatus = params.action === 'approve' ? 'verified' : params.action === 'flag' ? 'flagged' : 'rejected';
        await db
            .update(verificationProofs)
            .set({
                status: newStatus,
                verifiedBy: params.adminId,
                verifiedAt: new Date()
            })
            .where(eq(verificationProofs.id, queueItem.itemId));

        // Trust Score Event
        if (newStatus === 'verified') {
            await TrustScoreService.logEvent(
                queueItem.userId,
                'PROOF_VERIFIED_MANUAL',
                10, // Proofs usually worth more
                `Proof ${queueItem.itemId} manually verified by admin`,
                'admin_review'
            );
        }
    }

    // If flagged, create fraud log
    if (params.action === 'flag' && params.fraudFlags) {
        await db
            .insert(fraudDetectionLogs)
            .values({
                userId: queueItem.userId,
                detectionType: 'pattern_anomaly',
                severity: 'high',
                riskScore: 75,
                sourceType: queueItem.itemType,
                sourceId: queueItem.itemId,
                detectionData: { adminFlags: params.fraudFlags, notes: params.notes },
                status: 'pending',
                reviewedBy: params.adminId,
                reviewedAt: new Date()
            });

        // Log trust penalty
        await TrustScoreService.logEvent(
            queueItem.userId,
            'FRAUD_FLAG_MANUAL',
            -50,
            `Flagged by admin: ${params.notes}`,
            'admin_review'
        );
    }

    return { success: true };
}
