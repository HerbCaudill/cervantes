import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"
import path from "path"
import {
  PWA_GLOB_PATTERN,
  PWA_MAXIMUM_FILE_SIZE_TO_CACHE_IN_BYTES,
} from "./scripts/pwa/constants.ts"

/** Route the assigned loopback port and hot reload through the shared HTTPS proxy. */
const localhostServer =
  process.env.PORTLESS_URL ?
    {
      port: Number(process.env.PORT),
      host: "127.0.0.1",
      strictPort: true,
      allowedHosts: [new URL(process.env.PORTLESS_URL).hostname],
      hmr: {
        protocol: "wss" as const,
        host: new URL(process.env.PORTLESS_URL).hostname,
        clientPort: 443,
      },
    }
  : {}

export default defineConfig({
  ...(process.env.PORTLESS_URL ?
    { cacheDir: `node_modules/.cache/localhost-dev/${process.env.PORT}` }
  : {}),
  server: {
    port: 5179,

    ...localhostServer,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Cervantes Study",
        short_name: "Cervantes Study",
        start_url: "/",
        display: "standalone",
        background_color: "#f3f3ef",
        theme_color: "#14161a",
        lang: "es",
        icons: [
          {
            src: "/cervantes-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/cervantes-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: [PWA_GLOB_PATTERN],
        maximumFileSizeToCacheInBytes: PWA_MAXIMUM_FILE_SIZE_TO_CACHE_IN_BYTES,
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api(?:[/?]|$)/, /\/[^/?]+\.[^/]+$/, /\/\.[^/]+(?:\/|$)/],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
