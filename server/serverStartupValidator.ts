/**
 * Server Startup Validator
 * 
 * Validates critical environment variables on server startup.
 * Prevents the server from starting with insecure configurations.
 */

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export function validateServerConfig(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // CRITICAL: Validate ADMIN_EMAILS is properly configured
    const adminEmails = process.env.ADMIN_EMAILS;
    if (!adminEmails || adminEmails.trim() === '') {
        errors.push('CRITICAL: ADMIN_EMAILS environment variable is not set. Admin endpoints would be inaccessible.');
    } else {
        const emails = adminEmails.split(',').map(e => e.trim()).filter(e => e.length > 0);
        if (emails.length === 0) {
            errors.push('CRITICAL: ADMIN_EMAILS contains no valid email addresses.');
        } else {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const invalidEmails = emails.filter(email => !emailRegex.test(email));
            if (invalidEmails.length > 0) {
                warnings.push(`WARNING: ADMIN_EMAILS contains potentially invalid email addresses: ${invalidEmails.join(', ')}`);
            }
            console.log(`✅ Admin access configured for ${emails.length} email(s): ${emails.join(', ')}`);
        }
    }

    // Validate SESSION_SECRET in production
    if (process.env.NODE_ENV === 'production') {
        const sessionSecret = process.env.SESSION_SECRET;
        if (!sessionSecret || sessionSecret === 'dev-secret-change-in-production') {
            // Auto-generate a secure session secret instead of crashing
            const crypto = require('crypto');
            const generatedSecret = crypto.randomBytes(32).toString('hex');
            process.env.SESSION_SECRET = generatedSecret;

            console.warn('⚠️⚠️⚠️ WARNING: SESSION_SECRET not configured! ⚠️⚠️⚠️');
            console.warn('🔐 Auto-generated a secure session secret for this instance.');
            console.warn('⚠️  Sessions will NOT persist across deployments!');
            console.warn('📋 Action Required: Set SESSION_SECRET in Railway environment variables');
            console.warn('   1. Go to Railway project settings');
            console.warn('   2. Add: SESSION_SECRET = <random 32+ character string>');
            console.warn('   3. Redeploy for persistent sessions');
            console.warn('⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️\n');
        } else if (sessionSecret.length < 32) {
            warnings.push('WARNING: SESSION_SECRET should be at least 32 characters for security.');
        }
    }

    // Validate DATABASE_URL
    if (!process.env.DATABASE_URL) {
        warnings.push('WARNING: DATABASE_URL is not set. Using local SQLite database.');
    }

    // Validate BASE_URL
    if (!process.env.BASE_URL) {
        warnings.push('WARNING: BASE_URL is not set. OAuth callbacks may not work correctly.');
    }

    // NOTE: PayPal has been fully removed. GG LOOP uses Stripe only.
    // This validation block intentionally left empty for documentation.

    // Stripe validation (LIVE mode only)
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey) {
        warnings.push('WARNING: STRIPE_SECRET_KEY not configured. Stripe payment processing will fail.');
    } else {
        // Validate Stripe key format (starts with sk_live_ for live mode)
        if (!stripeSecretKey.startsWith('sk_live_')) {
            errors.push('CRITICAL: STRIPE_SECRET_KEY must be a LIVE key (starts with sk_live_). Test keys are not allowed.');
        }
        console.log('✅ Stripe secret key configured (LIVE mode)');
    }

    if (!stripePublishableKey) {
        warnings.push('WARNING: STRIPE_PUBLISHABLE_KEY not configured. Frontend cannot initialize Stripe.');
    } else if (!stripePublishableKey.startsWith('pk_live_')) {
        errors.push('CRITICAL: STRIPE_PUBLISHABLE_KEY must be a LIVE key (starts with pk_live_). Test keys are not allowed.');
    }

    if (!stripeWebhookSecret) {
        warnings.push('WARNING: STRIPE_WEBHOOK_SECRET not configured. Webhook signature verification will fail.');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

export function enforceSecureStartup(): void {
    console.log('🔐 Validating server security configuration...');

    const result = validateServerConfig();

    // Display warnings
    result.warnings.forEach(warning => {
        console.warn(`⚠️  ${warning}`);
    });

    // Display errors and exit if invalid
    if (!result.valid) {
        console.error('\n❌ SERVER STARTUP FAILED - SECURITY VALIDATION ERRORS:\n');
        result.errors.forEach(error => {
            console.error(`   ❌ ${error}`);
        });
        console.error('\n🛑 Server cannot start with insecure configuration.');
        console.error('📋 Please set the required environment variables and try again.\n');
        process.exit(1);
    }

    console.log('✅ Security validation passed\n');
}
