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
    const distPath = path.resolve(__dirname, "..", "dist", "public");
    const fallbackPath = path.resolve(__dirname, "..", "client", "public");

    if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.use("*", (_req, res) => res.sendFile(path.resolve(distPath, "index.html")));
    } else {
        console.warn(`Build directory missing, serving fallback from ${fallbackPath}`);
        app.use(express.static(fallbackPath));
        app.use("*", (_req, res) => res.sendFile(path.resolve(fallbackPath, "uplink.html")));
    }
    return;

    // app.use(express.static(distPath)); // Handled above

    // fall through to index.html if the file doesn't exist
    // Fallback handled above
}
