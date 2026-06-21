import { test, expect } from "@playwright/test"

test("answers a question and grades it", async ({ page }) => {
  await page.goto("/")

  // the header is always present
  await expect(page.getByRole("heading", { name: /CCSE practice/i })).toBeVisible()

  // the first sample question is true/false with "Verdadero" correct: answer it
  await page.getByRole("button", { name: "Verdadero" }).click()

  // a correct answer reveals the SM-2 grade controls; grade it Good
  const good = page.getByRole("button", { name: /^good/i })
  await expect(good).toBeVisible()
  await good.click()

  // the next question's options are now shown
  await expect(page.getByRole("button", { name: "Verdadero" })).toBeVisible()
})
