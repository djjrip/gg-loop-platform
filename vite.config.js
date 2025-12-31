import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
    plugins: [
        react(),
    ],
    define: {
        "process.env.BUILD_TIMESTAMP": JSON.stringify(new Date().toISOString()),
        "import.meta.env.VITE_PAYPAL_CLIENT_ID": JSON.stringify(process.env.VITE_PAYPAL_CLIENT_ID || ""),
    },
    resolve: {
        alias: {
            "@": path.resolve(process.cwd(), "client", "src"),
            "@shared": path.resolve(process.cwd(), "shared"),
            "@assets": path.resolve(process.cwd(), "attached_assets"),
        },
    },
    root: path.resolve(process.cwd(), "client"),
    publicDir: path.resolve(process.cwd(), "public"),
    build: {
        outDir: path.resolve(process.cwd(), "dist/public"),
        emptyOutDir: true,
    },
    server: {
        fs: {
            strict: true,
            deny: ["./**/.*"],
        },
    },
});
