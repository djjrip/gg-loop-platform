import { collectDefaultMetrics, Counter, Registry } from 'prom-client';
// Create a Registry which registers the metrics
const register = new Registry();
// Add default metrics (process, heap, etc.)
collectDefaultMetrics({ register });
// Example custom metric: total HTTP requests
export const httpRequestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
});
// Middleware to count requests
export function metricsMiddleware(req, _res, next) {
    // Increment after response finishes to capture status
    const end = () => {
        const route = req.route?.path || req.path;
        const status = res.statusCode?.toString() || 'unknown';
        httpRequestCounter.inc({ method: req.method, route, status });
        res.removeListener('finish', end);
    };
    const res = _res;
    res.on('finish', end);
    next();
}
// Expose /metrics endpoint
export function registerMetricsEndpoint(app) {
    app.get('/metrics', async (_req, res) => {
        try {
            const metrics = await register.metrics();
            res.set('Content-Type', register.contentType);
            res.send(metrics);
        }
        catch (ex) {
            res.status(500).end();
        }
    });
}
