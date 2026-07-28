import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e/pwa",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:4179",
    serviceWorkers: "allow",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium-pwa",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm build && pnpm exec vite preview --host 127.0.0.1 --port 4179 --strictPort",
    url: "http://127.0.0.1:4179",
    reuseExistingServer: false,
  },
})
