import { collectDefaultMetrics, Counter, Registry } from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

// Create a Registry which registers the metrics
const register = new Registry();
// Add default metrics (process, heap, etc.)
collectDefaultMetrics({ register });

// Example custom metric: total HTTP requests
export const httpRequestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'] as const,
    registers: [register],
});

// Middleware to count requests
export function metricsMiddleware(req: Request, _res: Response, next: NextFunction) {
    // Increment after response finishes to capture status
    const end = () => {
        const route = req.route?.path || req.path;
        const status = (res as any).statusCode?.toString() || 'unknown';
        httpRequestCounter.inc({ method: req.method, route, status });
        res.removeListener('finish', end);
    };
    const res = _res as Response;
    res.on('finish', end);
    next();
}

// Expose /metrics endpoint
export function registerMetricsEndpoint(app: any) {
    app.get('/metrics', async (_req: Request, res: Response) => {
        try {
            const metrics = await register.metrics();
            res.set('Content-Type', register.contentType);
            res.send(metrics);
        } catch (ex) {
            res.status(500).end();
        }
    });
}
