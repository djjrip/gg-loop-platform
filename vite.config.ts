```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
// import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import devBanner from "@replit/vite-plugin-dev-banner";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.NODE_ENV !== "production" ? [runtimeErrorOverlay(), devBanner({ displayStackFrames: false })] : []),
  ],
  define: {
    "process.env.BUILD_TIMESTAMP": JSON.stringify(new Date().toISOString()),
    // CRITICAL: Explicitly define VITE_ vars for Railway builds
    // Railway sometimes doesn't expose build-time vars properly
    "import.meta.env.VITE_PAYPAL_CLIENT_ID": JSON.stringify(
      process.env.VITE_PAYPAL_CLIENT_ID || ""
    ),
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
      deny: ["**/.*"],
    },
  },
});
