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

test("reads every manual block accessibly on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/manual/task-5/task-5-draft-page-78")

  const article = page.getByRole("article")
  const table = article.getByRole("table")
  const firstCell = table.getByRole("cell").first()

  await expect(article.getByText("En España hay tres tipos de centros educativos")).toBeVisible()
  await expect(table.getByRole("columnheader", { name: "Nivel educativo" })).toBeAttached()
  await expect(firstCell).toHaveAttribute("data-label", "Nivel educativo")
  await expect(firstCell).toHaveCSS("display", "grid")
  await expect(article.getByRole("figure").getByRole("img")).toBeVisible()
  await expect(article.getByRole("complementary")).toBeVisible()
  await expect(article.getByRole("link", { name: /Fuente oficial/i })).toHaveCount(1)

  const bodyText = article.getByText(
    "En España hay tres tipos de centros educativos según su financiación:",
  )
  await expect(bodyText).toHaveCSS("font-size", "17px")

  const marginalRow = bodyText.locator("xpath=../..")
  expect(
    await marginalRow.evaluate(element => getComputedStyle(element).gridTemplateColumns),
  ).toMatch(/^40px /)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true)
})

test("uses a conventional table on wide screens and supports the dark palette", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1000, height: 900 })
  await page.goto("/manual/task-5/task-5-draft-page-78")

  const article = page.getByRole("article")
  const table = article.getByRole("table")
  const firstCell = table.getByRole("cell").first()

  await expect(table).toHaveCSS("display", "table")
  await expect(firstCell).toHaveCSS("display", "table-cell")

  await page.locator("html").evaluate(element => element.classList.add("dark"))
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(23, 24, 26)")
  await expect(article).toHaveCSS("color", "rgb(232, 231, 224)")
})

test("moves between topics across task boundaries", async ({ page }) => {
  await page.goto("/manual/task-1/task-1-draft-page-17")

  await page.getByRole("link", { name: /Siguiente.*DESTACADOS DERECHOS/i }).click()

  await expect(page).toHaveURL("/manual/task-2/task-2-draft-page-28")
  await expect(page.getByText("T2 · 01")).toBeVisible()
  await expect(page.getByRole("link", { name: /Anterior.*Gobierno/i })).toHaveAttribute(
    "href",
    "/manual/task-1/task-1-draft-page-17",
  )
})
