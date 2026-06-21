import { test, expect } from "@playwright/test"

test("reveals an answer and grades a card", async ({ page }) => {
  await page.goto("/")

  // the deck header is always present
  await expect(page.getByRole("heading", { name: /DELE flash cards/i })).toBeVisible()

  // a fresh deck has cards due: reveal the answer, then grade it
  await page.getByRole("button", { name: /show answer/i }).click()
  await expect(page.getByRole("button", { name: /^good/i })).toBeVisible()
  await page.getByRole("button", { name: /^good/i }).click()

  // after grading, the next card's reveal control appears
  await expect(page.getByRole("button", { name: /show answer/i })).toBeVisible()
})
