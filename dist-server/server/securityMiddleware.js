/**
 * SECURITY HARDENING - Rate Limiting & Helmet
 * Protects against brute force, DDoS, and common attacks
 */
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
/**
 * Apply Helmet security headers
 * Adds 11+ security headers automatically
 */
export function applyHelmetSecurity(app) {
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'", // Needed for React
                    "https://www.paypal.com",
                    "https://www.paypalobjects.com",
                    "https://www.google-analytics.com"
                ],
                styleSrc: ["'self'", "'unsafe-inline'"], // Needed for styled components
                imgSrc: ["'self'", "data:", "https:"],
                fontSrc: ["'self'", "https:", "data:"],
                connectSrc: ["'self'", "https:"],
                frameSrc: ["'self'", "https://www.paypal.com"]
            }
        },
        hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true
        }
    }));
    console.log('✅ Helmet security headers applied');
}
/**
 * Global API rate limiter
 * Prevents abuse across all API endpoints
 */
export const globalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window per IP
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * Strict rate limiter for admin routes
 * Prevents brute force attacks on admin panel
 */
export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Only 20 admin requests per window
    message: 'Too many admin requests, please try again later.',
    skipSuccessfulRequests: false,
});
/**
 * Auth endpoint rate limiter
 * Protects login/OAuth endpoints from brute force
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Only 10 auth attempts per window
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true, // Don't count successful logins
});
/**
 * Subscription/Payment rate limiter
 * Prevents rapid-fire subscription attempts
 */
export const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Only 5 payment attempts per hour
    message: 'Too many payment attempts, please try again later.',
});
/**
 * Match tracking rate limiter
 * Prevents API abuse on match tracking endpoints
 */
export const matchTrackingLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // 30 match tracking requests per 5 minutes
    message: 'Too many match tracking requests, please slow down.',
});
console.log('✅ Rate limiting configured');
