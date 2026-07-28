import { test, expect } from "@playwright/test"

test("answers a question and grades it", async ({ page }) => {
  const externalFontRequests: string[] = []
  page.on("request", request => {
    if (
      request.url().includes("fonts.googleapis.com") ||
      request.url().includes("fonts.gstatic.com")
    ) {
      externalFontRequests.push(request.url())
    }
  })

  await page.goto("/")

  await expect(page.locator("html")).toHaveAttribute("lang", "es")
  expect(externalFontRequests).toEqual([])

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
  await expect(page.getByRole("list", { name: "1 repasadas, 299 en la cola" })).toBeVisible()

  // visiting the manual does not restart the live review queue
  await page.getByRole("link", { name: "Manual", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Manual CCSE" })).toBeVisible()
  await page.getByRole("link", { name: "Práctica" }).click()
  await expect(page.getByRole("button", { name: "Constitución." })).toBeVisible()
  await expect(page.getByRole("list", { name: "1 repasadas, 299 en la cola" })).toBeVisible()
})

test("navigates direct manual routes with browser history", async ({ page }) => {
  await page.goto("/manual")
  await expect(page.getByRole("heading", { name: "Manual CCSE" })).toBeVisible()

  await page.getByRole("link", { name: "Tarea 1" }).click()
  await expect(
    page.getByRole("heading", { name: "Gobierno, legislación y participación ciudadana" }),
  ).toBeVisible()

  await page
    .getByRole("link", { name: /Poderes del Estado/i })
    .first()
    .click()
  await expect(page.getByRole("heading", { name: /Poderes del Estado/i })).toBeVisible()

  await page.goBack()
  await expect(
    page.getByRole("heading", { name: "Gobierno, legislación y participación ciudadana" }),
  ).toBeVisible()

  await page.goForward()
  await expect(page.getByRole("heading", { name: /Poderes del Estado/i })).toBeVisible()

  await page.getByRole("link", { name: "Manual" }).click()
  await page.getByRole("link", { name: "Buscar en el manual" }).click()
  await expect(page.getByRole("searchbox", { name: "Buscar en el manual" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Práctica" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Manual", exact: true })).toBeVisible()
})
