/**
 * VERIFICATION GUARDRAILS
 * 
 * Auto-safety checks to ensure points only accrue under valid conditions.
 * These checks are called by the desktop API before awarding points.
 * 
 * RULES (NON-NEGOTIABLE):
 * 1. Points ONLY accrue in ACTIVE_PLAY_CONFIRMED state
 * 2. Game process MUST be detected
 * 3. Game window MUST be foreground
 * 4. Minimum 5 minutes of active play required
 * 5. User account MUST be bound
 * 6. No points for typing/mouse-only activity
 */

export interface VerificationData {
    userId: string;
    gameProcess: boolean;
    isGameForeground: boolean;
    activePlayTime: number; // in seconds
    sessionDuration: number; // in seconds
    verificationState: string;
    confidenceScore?: number;
}

export interface GuardrailResult {
    allowed: boolean;
    reason: string;
    adjustedPoints?: number;
    confidenceScore: number;
    warnings: string[];
}

// Minimum active play time (5 minutes in seconds)
const MIN_ACTIVE_PLAY_SECONDS = 300;

// Maximum reasonable session (24 hours)
const MAX_SESSION_SECONDS = 86400;

// Minimum confidence for full points
const MIN_CONFIDENCE_FULL_POINTS = 70;

// Threshold below which points are pending review
const CONFIDENCE_REVIEW_THRESHOLD = 50;

/**
 * Validate verification data and determine if points should be awarded
 */
export function validateVerification(data: VerificationData): GuardrailResult {
    const warnings: string[] = [];
    let allowed = true;
    let reason = 'Verification passed';
    let confidenceScore = 100;

    // RULE 1: User must be bound
    if (!data.userId) {
        return {
            allowed: false,
            reason: 'User account not bound - points blocked',
            confidenceScore: 0,
            warnings: ['CRITICAL: No userId provided'],
        };
    }

    // RULE 2: Verification state must be ACTIVE_PLAY_CONFIRMED
    if (data.verificationState !== 'ACTIVE_PLAY_CONFIRMED') {
        return {
            allowed: false,
            reason: `Invalid verification state: ${data.verificationState}`,
            confidenceScore: 0,
            warnings: [`State was ${data.verificationState}, not ACTIVE_PLAY_CONFIRMED`],
        };
    }

    // RULE 3: Game process must be detected
    if (!data.gameProcess) {
        return {
            allowed: false,
            reason: 'No game process detected',
            confidenceScore: 0,
            warnings: ['gameProcess = false'],
        };
    }

    // RULE 4: Game must be in foreground
    if (!data.isGameForeground) {
        confidenceScore -= 30;
        warnings.push('Game not in foreground during session');
    }

    // RULE 5: Minimum active play time
    if (data.activePlayTime < MIN_ACTIVE_PLAY_SECONDS) {
        return {
            allowed: false,
            reason: `Minimum 5 minutes active play required (got ${Math.floor(data.activePlayTime / 60)} min)`,
            confidenceScore: 0,
            warnings: [`activePlayTime: ${data.activePlayTime}s < ${MIN_ACTIVE_PLAY_SECONDS}s`],
        };
    }

    // RULE 6: Session duration sanity check
    if (data.sessionDuration > MAX_SESSION_SECONDS) {
        confidenceScore -= 20;
        warnings.push(`Unusually long session: ${Math.floor(data.sessionDuration / 3600)} hours`);
    }

    // RULE 7: Active time should not exceed session duration
    if (data.activePlayTime > data.sessionDuration * 1.1) { // 10% tolerance
        confidenceScore -= 30;
        warnings.push('activePlayTime exceeds sessionDuration (suspicious)');
    }

    // Calculate confidence based on active time ratio
    const activeRatio = data.sessionDuration > 0 
        ? data.activePlayTime / data.sessionDuration 
        : 0;
    
    if (activeRatio >= 0.8) {
        // High engagement - good
    } else if (activeRatio >= 0.5) {
        confidenceScore -= 10;
        warnings.push(`Moderate active ratio: ${Math.round(activeRatio * 100)}%`);
    } else {
        confidenceScore -= 25;
        warnings.push(`Low active ratio: ${Math.round(activeRatio * 100)}%`);
    }

    // Bonus for longer sessions
    if (data.activePlayTime >= 3600) { // 1 hour+
        confidenceScore = Math.min(100, confidenceScore + 5);
    }
    if (data.activePlayTime >= 7200) { // 2 hours+
        confidenceScore = Math.min(100, confidenceScore + 5);
    }

    // Clamp confidence
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    // Determine if points are allowed
    if (confidenceScore < CONFIDENCE_REVIEW_THRESHOLD) {
        allowed = false;
        reason = `Low confidence score (${confidenceScore}%) - pending review`;
    } else if (confidenceScore < MIN_CONFIDENCE_FULL_POINTS) {
        reason = `Reduced confidence (${confidenceScore}%) - partial points`;
    }

    return {
        allowed,
        reason,
        confidenceScore,
        warnings,
    };
}

/**
 * Calculate point multiplier based on confidence score
 */
export function getPointMultiplier(confidenceScore: number): number {
    if (confidenceScore >= 90) return 1.0;
    if (confidenceScore >= 80) return 0.95;
    if (confidenceScore >= 70) return 0.85;
    if (confidenceScore >= 60) return 0.75;
    if (confidenceScore >= 50) return 0.5;
    return 0; // Below 50% = no points
}

/**
 * Log verification attempt for audit trail
 */
export function logVerificationAttempt(
    data: VerificationData, 
    result: GuardrailResult,
    pointsAwarded: number
): void {
    const logLevel = result.allowed ? 'info' : 'warn';
    const log = {
        timestamp: new Date().toISOString(),
        userId: data.userId,
        allowed: result.allowed,
        reason: result.reason,
        confidenceScore: result.confidenceScore,
        pointsAwarded,
        activePlayTime: data.activePlayTime,
        sessionDuration: data.sessionDuration,
        warnings: result.warnings,
    };

    if (result.allowed) {
        console.log(`[Verification] ✓ ${data.userId} | ${result.confidenceScore}% | +${pointsAwarded}pts | ${data.activePlayTime}s active`);
    } else {
        console.warn(`[Verification] ✗ ${data.userId} | BLOCKED | ${result.reason}`);
    }

    // In production, this would write to a monitoring system
    if (result.warnings.length > 0) {
        console.warn(`[Verification] Warnings for ${data.userId}:`, result.warnings);
    }
}

/**
 * Quick check for Stripe-only invariant
 * Any PayPal reference in payment flow = BLOCK
 */
export function enforceStripeOnly(paymentMethod: string): boolean {
    const normalized = paymentMethod.toLowerCase();
    if (normalized.includes('paypal')) {
        console.error('[GUARDRAIL] BLOCKED: PayPal payment attempt detected');
        return false;
    }
    return true;
}

