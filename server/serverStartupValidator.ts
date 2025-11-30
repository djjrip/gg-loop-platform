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
            errors.push('CRITICAL: SESSION_SECRET must be set to a secure random value in production.');
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
