import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
    // In production, compiled server is in dist/server/
    // Frontend build is in dist/public/
    const distPath = path.resolve(__dirname, "..", "public");
    const fallbackPath = path.resolve(__dirname, "..", "..", "client", "public");

    console.log(`📁 Attempting to serve static files from: ${distPath}`);

    if (fs.existsSync(distPath)) {
        console.log(`✅ Found dist directory, serving from: ${distPath}`);
        app.use(express.static(distPath));
        // SPA fallback: always serve index.html for client-side routing
        app.use("*", (_req, res) => res.sendFile(path.resolve(distPath, "index.html")));
    } else if (fs.existsSync(fallbackPath) && fs.existsSync(path.resolve(fallbackPath, "index.html"))) {
        // Fallback: only serve from client/public if index.html exists
        console.warn(`⚠️ Build directory missing at ${distPath}, using client/public fallback`);
        app.use(express.static(fallbackPath));
        app.use("*", (_req, res) => res.sendFile(path.resolve(fallbackPath, "index.html")));
    } else {
        // CRITICAL: Never serve uplink.html or internal pages to public root
        console.error(`❌ No valid frontend build found. Frontend will not load.`);
        console.error(`   Checked:\n  - ${distPath}\n  - ${fallbackPath}`);
        // Return a minimal error page instead of exposing internals
        app.use("*", (_req, res) => {
            res.status(503).send(`
                <!DOCTYPE html>
                <html>
                <head><title>GG LOOP - Maintenance</title></head>
                <body style="background:#0a0a0f;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
                    <div style="text-align:center;">
                        <h1 style="color:#d4a574;">GG LOOP</h1>
                        <p>Site temporarily unavailable. Please try again shortly.</p>
                    </div>
                </body>
                </html>
            `);
        });
    }
}

