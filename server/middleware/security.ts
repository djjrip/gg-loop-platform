/**
 * Security Middleware
 * Rate limiting, CORS, XSS protection, SQL injection prevention
 */

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate limiting - prevent brute force attacks
 */
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiting for auth endpoints
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Only 5 login attempts per 15 minutes
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
});

/**
 * API rate limiting
 */
export const apiRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: 'API rate limit exceeded.',
});

/**
 * Helmet - security headers
 */
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.riotgames.com", "https://api.paypal.com"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
});

/**
 * CORS configuration
 */
export const corsOptions = cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'https://ggloop.io',
            'https://www.ggloop.io',
            process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : null,
        ].filter(Boolean);

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

/**
 * Input sanitization - prevent XSS
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';

    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Session security
 */
export const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        httpOnly: true, // Prevent XSS attacks
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict' as const, // CSRF protection
    },
};

/**
 * Error handler - don't expose stack traces in production
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.error('Error:', err);

    if (process.env.NODE_ENV === 'production') {
        // Generic error message in production
        res.status(500).json({
            error: 'An error occurred. Please try again later.',
        });
    } else {
        // Detailed error in development
        res.status(500).json({
            error: err.message,
            stack: err.stack,
        });
    }
}

/**
 * SQL injection prevention helper
 * Always use parameterized queries via Drizzle ORM
 */
export function validateSqlInput(input: any): boolean {
    if (typeof input !== 'string') return true;

    // Check for SQL injection patterns
    const sqlInjectionPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|DECLARE)\b)/i,
        /(--)|;|\/\*|\*\/|'|"|`|xp_|sp_/i,
    ];

    return !sqlInjectionPatterns.some(pattern => pattern.test(input));
}

/**
 * CSRF token generation
 */
export function generateCsrfToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(token: string, sessionToken: string): boolean {
    return token === sessionToken;
}
