/**
 * GG LOOP Verification System Configuration
 * Centralized configuration for fraud detection, auto-approval, and verification workflows
 */

export const verificationConfig = {
    /**
     * FRAUD DETECTION THRESHOLDS
     */
    fraud: {
        // Risk score thresholds (0-100 scale)
        riskThresholds: {
            low: 30,      // 0-30: Auto-approve
            medium: 70,   // 31-70: Queue for review
            high: 90,     // 71-90: Flag as suspicious
            critical: 100 // 91-100: Auto-reject
        },

        // Detection sensitivity
        sensitivity: {
            duplicateSubmission: {
                enabled: true,
                timeWindowHours: 24,
                maxSubmissionsPerWindow: 10
            },
            impossibleTiming: {
                enabled: true,
                minMatchDurationMinutes: 15,
                maxMatchesPerHour: 6
            },
            ipMismatch: {
                enabled: true,
                allowVPN: true,
                maxIPsPerDay: 3
            },
            patternAnomaly: {
                enabled: true,
                minHistoricalMatches: 10,
                deviationThreshold: 2.5 // Standard deviations
            }
        },

        // Fraud flag weights (contribute to overall risk score)
        flagWeights: {
            duplicate_submission: 25,
            impossible_timing: 30,
            ip_mismatch: 15,
            pattern_anomaly: 20,
            suspicious_proof: 25,
            account_age_new: 10,
            rapid_progression: 15
        }
    },

    /**
     * AUTO-APPROVAL CRITERIA
     */
    autoApproval: {
        // Enable/disable auto-approval
        enabled: true,

        // Shadow mode: log decisions but don't auto-approve (for testing)
        shadowMode: true, // SET TO FALSE WHEN READY FOR PRODUCTION

        // Criteria for auto-approval
        criteria: {
            maxRiskScore: 30,
            minVerificationScore: 70,
            requireRiotApiMatch: true,
            requireProof: false, // Will be true when desktop verifier launches
            minAccountAgeDays: 7,
            minHistoricalMatches: 5
        },

        // Point limits for auto-approval
        pointLimits: {
            perMatch: 100,
            perDay: 500,
            perWeek: 2000
        }
    },

    /**
     * VERIFICATION SCORING
     */
    scoring: {
        // Base scores for different verification methods
        baseScores: {
            riotApiMatch: 80,
            proofWithMetadata: 70,
            proofWithoutMetadata: 50,
            manualReview: 100
        },

        // Score modifiers
        modifiers: {
            accountAge: {
                under7Days: -10,
                under30Days: 0,
                over30Days: 5,
                over90Days: 10
            },
            historicalAccuracy: {
                under80Percent: -15,
                under90Percent: 0,
                over90Percent: 5,
                over95Percent: 10
            },
            proofQuality: {
                highRes: 10,
                mediumRes: 5,
                lowRes: -5,
                noExif: -10
            }
        }
    },

    /**
     * VERIFICATION QUEUE MANAGEMENT
     */
    queue: {
        // Priority levels (1=low, 2=medium, 3=high, 4=critical)
        priorityRules: {
            highRiskScore: 4,      // Risk score > 70
            largePointValue: 3,    // Points > 200
            repeatOffender: 4,     // User has previous fraud flags
            newAccount: 2,         // Account < 7 days old
            default: 1
        },

        // SLA (Service Level Agreement) deadlines
        sla: {
            critical: 4,   // 4 hours
            high: 24,      // 24 hours
            medium: 48,    // 48 hours
            low: 72        // 72 hours
        },

        // Auto-assignment rules
        assignment: {
            enabled: false, // Manual assignment for now
            roundRobin: true,
            maxItemsPerAdmin: 20
        }
    },

    /**
     * PROOF REQUIREMENTS
     */
    proof: {
        // File upload limits
        upload: {
            maxFileSizeMB: 50,
            maxFilesPerSubmission: 5,
            allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm'],
            requireExifData: false // Will be true when desktop verifier launches
        },

        // Proof validation
        validation: {
            checkImageTampering: true,
            checkVideoEditing: false, // Future: ML-based detection
            requireTimestamp: false,  // Will be true with desktop verifier
            requireDeviceSignature: false // Will be true with desktop verifier
        }
    },

    /**
     * RIOT API INTEGRATION
     */
    riot: {
        // Match validation
        validation: {
            requireMatchInHistory: true,
            maxMatchAgeDays: 7,
            verifyPlayerPUUID: true,
            verifyMatchOutcome: true
        },

        // Rate limiting
        rateLimit: {
            requestsPerSecond: 20,
            requestsPerMinute: 100,
            retryAttempts: 3,
            retryDelayMs: 1000
        }
    },

    /**
     * ADMIN NOTIFICATIONS
     */
    notifications: {
        // When to notify admins
        triggers: {
            criticalFraud: true,      // Risk score > 90
            queueBacklog: true,       // Queue > 50 items
            slaViolation: true,       // Item past SLA deadline
            systemError: true         // Verification system errors
        },

        // Notification channels
        channels: {
            discord: true,
            email: false, // Future
            slack: false  // Future
        }
    },

    /**
     * FEATURE FLAGS
     */
    features: {
        // Level 4 features (current)
        enableVerificationQueue: true,
        enableFraudDetection: true,
        enableProofUpload: true,
        enableAdminReview: true,

        // Level 5 features (future - desktop verifier)
        enableDesktopVerifier: false,
        enableCryptographicProof: false,
        enableDeviceFingerprinting: false,

        // Level 6 features (future - reward economy)
        enableRewardMultipliers: false,
        enableSubscriptionTiers: false,

        // Temporary freeze
        enableGameplayRewards: false, // DISABLED until Level 5 complete
        enablePointAwarding: false    // DISABLED until Level 5 complete
    },

    /**
     * COOLDOWNS & LIMITS
     */
    limits: {
        // Submission cooldowns
        cooldowns: {
            betweenSubmissionsMinutes: 15,
            betweenProofUploadsMinutes: 5,
            dailySubmissionLimit: 20
        },

        // Point limits (enforced even in shadow mode)
        points: {
            maxPerMatch: 100,
            maxPerDay: 500,
            maxPerWeek: 2000,
            maxPerMonth: 7500
        }
    }
} as const;

// Type exports for TypeScript
export type VerificationConfig = typeof verificationConfig;
export type FraudDetectionType = 'duplicate_submission' | 'impossible_timing' | 'ip_mismatch' | 'pattern_anomaly' | 'suspicious_proof' | 'account_age_new' | 'rapid_progression';
export type VerificationMethod = 'auto' | 'manual' | 'hybrid' | 'pending';
export type QueuePriority = 1 | 2 | 3 | 4;
export type QueueStatus = 'pending' | 'in_review' | 'completed' | 'skipped';
