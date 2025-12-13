import type { Request, Response, NextFunction } from 'express';

// Middleware that adds a unique request ID to each incoming request
export function requestId(req: Request, _res: Response, next: NextFunction) {
    // Use native crypto.randomUUID if available (Node >=14.17). Fallback not needed.
    const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID()
        : 'req-' + Math.random().toString(36).substring(2, 15);
    (req as any).id = id;
    // Also expose it on the response header for debugging if needed
    req.headers['x-request-id'] = id;
    next();
}
