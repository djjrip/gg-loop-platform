/**
 * Authentication Middleware
 *
 * Provides middleware for protecting routes that require a logged-in user.
 */
/**
 * Middleware to check if user is authenticated
 * Adds req.user from session if authenticated
 */
export const isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized - Please log in' });
    }
    // Set user info on request object
    req.user = { id: req.session.userId };
    next();
};
/**
 * Middleware to check admin access
 */
export const isAdmin = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const userEmail = req.user?.email;
    if (!userEmail || !adminEmails.includes(userEmail)) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
export default { isAuthenticated, isAdmin };
