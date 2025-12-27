/**
 * Authentication Middleware
 * 
 * Provides middleware for protecting routes that require a logged-in user.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated
 * Adds req.user from session if authenticated
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized - Please log in' });
    }

    // Set user info on request object
    (req as any).user = { id: req.session.userId };

    next();
};

/**
 * Middleware to check admin access
 */
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const userEmail = (req as any).user?.email;

    if (!userEmail || !adminEmails.includes(userEmail)) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
};

export default { isAuthenticated, isAdmin };
