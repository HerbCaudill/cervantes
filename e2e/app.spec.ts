import { test, expect } from "@playwright/test"

test("answers a question and grades it", async ({ page }) => {
  await page.goto("/")

  // the header is always present
  await expect(page.getByRole("heading", { name: /Boletín CCSE/i })).toBeVisible()
  await page.getByRole("button", { name: /Empezar repaso/i }).click()

  // answer the first official 2026 question correctly
  await page.getByRole("button", { name: "una monarquía parlamentaria." }).click()

  // a correct answer reveals the SM-2 grade controls; grade it Bien
  const good = page.getByRole("button", { name: /^bien/i })
  await expect(good).toBeVisible()
  await good.click()

  // the next official question's options are now shown
  await expect(page.getByRole("button", { name: "Constitución." })).toBeVisible()
})
