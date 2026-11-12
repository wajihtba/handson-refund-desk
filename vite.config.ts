import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// The web app's dev server and build. Provided: you shouldn't need to change
// this file.
//
// In the lab, your browser reaches the dev server through the platform's
// preview proxy at <app>/preview/refund-desk/5173/, and the proxy keeps that
// prefix. So the dev server serves the app under that base path. Opening
// http://localhost:5173/ on your laptop redirects there too.
//
// /api requests go to the API on port 3000, or on PORT when you set it
// (npm run dev starts both).
const PREVIEW_BASE = "/preview/refund-desk/5173/"

export default defineConfig(({ command }) => ({
  root: "src/web",
  base: command === "serve" ? PREVIEW_BASE : "/",
  plugins: [react()],
  server: {
    host: true, // listen on the lab's address, not only localhost
    port: 5173,
    strictPort: true, // the preview proxy only knows 5173: fail instead of moving
    // The lab's preview page has an origin of its own, so the dev server must
    // answer cross-origin requests, from any host name the proxy uses.
    cors: true,
    allowedHosts: true,
    proxy: {
      // The trailing slash matters: without it src/web/api.ts would go to the API too.
      [`${PREVIEW_BASE}api/`]: {
        target: `http://localhost:${process.env.PORT ?? 3000}`,
        rewrite: (path) => path.slice(PREVIEW_BASE.length - 1),
      },
    },
  },
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
}))
