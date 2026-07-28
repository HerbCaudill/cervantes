import { test, expect } from "@playwright/test"
import manualDraft from "../src/manual/manual.draft.json" with { type: "json" }

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
  await page.goto("/manual/task-5/sociedad-espanola-09")

  const article = page.getByRole("article")
  const table = article.getByRole("table")
  const firstCell = table.getByRole("cell").first()

  await expect(article.getByText("En España hay tres tipos de centros educativos")).toBeVisible()
  await expect(table.getByRole("columnheader", { name: "Nivel educativo" })).toBeAttached()
  await expect(firstCell).toHaveAttribute("data-label", "Nivel educativo")
  await expect(firstCell).toHaveCSS("display", "grid")
  await expect(article.getByRole("figure").getByRole("img")).toBeVisible()
  await expect(article.getByRole("note")).toBeVisible()
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

test("keeps a real article note on one line inside the 40px margin at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/manual/task-2/articulo-15-02")

  const note = page.locator("[data-margin-note='Art.15']").first()
  const noteBox = await note.boundingBox()

  expect(noteBox).not.toBeNull()
  expect(noteBox?.width).toBeLessThanOrEqual(40)
  expect(noteBox?.height).toBeLessThanOrEqual(19)
  await expect(page.getByRole("heading", { name: "Artículo 15" })).toBeVisible()
})

test("loads every semantic topic route accessibly at 390px", async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/manual")

  const topicUrls = await page
    .getByRole("navigation", { name: "Índice completo del manual" })
    .locator("a")
    .evaluateAll(links =>
      links
        .map(link => link.getAttribute("href"))
        .filter(
          (href): href is string => href !== null && href.split("/").filter(Boolean).length === 3,
        ),
    )
  const expectedTopicCount = manualDraft.sections.reduce(
    (count, section) => count + section.topics.length,
    0,
  )

  expect(topicUrls).toHaveLength(expectedTopicCount)
  expect(new Set(topicUrls).size).toBe(expectedTopicCount)
  expect(topicUrls.every(url => !url.includes("draft-page"))).toBe(true)

  for (const topicUrl of topicUrls) {
    await page.goto(topicUrl)

    await expect(page.getByRole("article")).toBeVisible()
    await expect(page.getByRole("article").getByRole("heading", { level: 2 })).toBeVisible()
    await expect(page.getByRole("complementary")).toHaveCount(0)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true)
  }
})

test("uses a conventional table on wide screens and supports the dark palette", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1000, height: 900 })
  await page.goto("/manual/task-5/sociedad-espanola-09")

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
  await page.goto("/manual/task-1/participacion-ciudadana-15")

  await page.getByRole("link", { name: /Siguiente.*DESTACADOS DERECHOS/i }).click()

  await expect(page).toHaveURL("/manual/task-2/destacados-derechos-deberes-y-libertades-01")
  await expect(page.getByText("T2 · 01")).toBeVisible()
  await expect(
    page.getByRole("link", { name: /Anterior.*Participación ciudadana/i }),
  ).toHaveAttribute("href", "/manual/task-1/participacion-ciudadana-15")
})

test("keeps meaningful small manual text legible in both themes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/manual/task-2/articulo-22-03")

  const previousLabel = page.getByText("‹ Anterior")
  await expect(previousLabel).toHaveCSS("color", "rgb(92, 95, 90)")
  expect(
    await previousLabel.evaluate(element => {
      const colors = [
        getComputedStyle(element).color,
        getComputedStyle(document.body).backgroundColor,
      ]
      const luminances = colors.map(color =>
        color
          .match(/\d+/g)!
          .slice(0, 3)
          .map(channel => Number(channel) / 255)
          .map(channel =>
            channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
          )
          .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0),
      )
      const [lighter, darker] = luminances.sort((left, right) => right - left)

      return (lighter + 0.05) / (darker + 0.05)
    }),
  ).toBeGreaterThanOrEqual(4.5)

  await page.goto("/manual")
  const firstTopicNumber = page
    .getByRole("navigation", { name: "Índice completo del manual" })
    .getByText("01", { exact: true })
    .nth(1)
  await expect(firstTopicNumber).toHaveCSS("color", "rgb(92, 95, 90)")

  await page.locator("html").evaluate(element => element.classList.add("dark"))
  await expect(firstTopicNumber).toHaveCSS("color", "rgb(163, 164, 157)")

  await page.goto("/manual/task-2/articulo-22-03")
  await page.locator("html").evaluate(element => element.classList.add("dark"))
  const darkPreviousLabel = page.getByText("‹ Anterior")
  await expect(darkPreviousLabel).toHaveCSS("color", "rgb(163, 164, 157)")
  expect(
    await darkPreviousLabel.evaluate(element => {
      const colors = [
        getComputedStyle(element).color,
        getComputedStyle(document.body).backgroundColor,
      ]
      const luminances = colors.map(color =>
        color
          .match(/\d+/g)!
          .slice(0, 3)
          .map(channel => Number(channel) / 255)
          .map(channel =>
            channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
          )
          .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0),
      )
      const [lighter, darker] = luminances.sort((left, right) => right - left)

      return (lighter + 0.05) / (darker + 0.05)
    }),
  ).toBeGreaterThanOrEqual(4.5)
})
