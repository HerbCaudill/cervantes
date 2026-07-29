import { test, expect } from "@playwright/test"
import manualDraft from "../src/manual/manual.draft.json" with { type: "json" }
import questionBank from "../src/data/questions.json" with { type: "json" }

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

test.describe("simplified practice interface", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ({ questions }) => {
        const states = Object.fromEntries(
          questions.map(({ id }, index) => [
            id,
            {
              questionId: id,
              repetitions: index === 0 ? 17 : 1,
              easeFactor: index === 0 ? 2.37 : 2.5,
              interval: index < 17 ? 23 : 1,
              due: index === 0 ? "2000-01-01T12:00:00.000Z" : "2100-01-01T12:00:00.000Z",
            },
          ]),
        )
        localStorage.setItem("ccse-flashcards:states", JSON.stringify(states))
      },
      { questions: questionBank },
    )
  })

  test("shows only the actionable queue count on the resting screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")

    await expect(page.getByRole("button", { name: "Empezar repaso · 1 pregunta" })).toBeVisible()
    await expect(page.getByText("Fijadas", { exact: true })).toHaveCount(0)
    await expect(page.getByText("17", { exact: true })).toHaveCount(0)
    await expect(page.getByRole("heading", { name: "Próximos 7 días" })).toHaveCount(0)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true)
  })

  test("keeps grading and scheduling without showing scheduler details", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    await page.getByRole("button", { name: "Empezar repaso · 1 pregunta" }).click()

    await expect(page.getByRole("list", { name: "0 repasadas, 1 en la cola" })).toBeVisible()
    await expect(page.getByText("Repasos", { exact: true })).toHaveCount(0)
    await expect(page.getByText("Facil.", { exact: true })).toHaveCount(0)
    await expect(page.getByText("Visto", { exact: true })).toHaveCount(0)
    await expect(page.getByText("Interv.", { exact: true })).toHaveCount(0)
    await expect(page.getByText("2,37", { exact: true })).toHaveCount(0)
    await expect(page.getByText("23 d", { exact: true })).toHaveCount(0)

    await page.getByRole("button", { name: "una monarquía parlamentaria." }).click()
    await expect(page.getByRole("button", { name: "Difícil", exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Bien", exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Fácil", exact: true })).toBeVisible()
    await expect(page.getByText("55 d", { exact: true })).toHaveCount(0)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true)

    await page.getByRole("button", { name: "Bien", exact: true }).click()
    await expect(page.getByText("No hay preguntas pendientes")).toBeVisible()
    const savedState = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("ccse-flashcards:states") ?? "{}"),
    )
    expect(savedState["1001"]).toMatchObject({ repetitions: 18, interval: 55 })
  })
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
  await page.goto("/manual/task-5/educacion-06")

  const article = page.getByRole("article")
  const table = article.getByRole("table")
  const firstCell = table.getByRole("cell").first()

  await expect(article.getByText("En España hay tres tipos de centros educativos")).toBeVisible()
  await expect(table.getByRole("columnheader", { name: "Nivel educativo" })).toBeAttached()
  await expect(firstCell).toHaveAttribute("data-label", "Nivel educativo")
  await expect(firstCell).toHaveCSS("display", "grid")
  await expect(article.getByRole("figure").getByRole("img").first()).toBeVisible()
  await expect(
    article.getByRole("note").filter({
      hasText: "Para acceder a la Universidad se requiere el título de Bachillerato",
    }),
  ).toBeVisible()
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

test("renders the one-year nationality cases as a nested unmarked list", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/manual/task-5/identificacion-personal-y-tramites-administrativos-01")

  const article = page.getByRole("article")
  const parentList = article.getByRole("list").filter({
    hasText: "1 año: en casos especiales, por ejemplo:",
  })
  const parentItem = parentList.locator(":scope > li")
  const childList = parentItem.locator(":scope > ul")
  const expectedCases = [
    "a. Nacido en España.",
    "b. Casado con un ciudadano español.",
    "c. Viudo de un ciudadano español (si no había separación).",
    "d. Haber residido bajo tutela o acogimiento de un ciudadano español.",
  ]

  await expect(parentItem).toHaveCount(1)
  await expect(childList).toHaveCount(1)
  await expect(childList).toHaveCSS("list-style-type", "none")
  const caseRows = expectedCases.map(text =>
    childList.locator(":scope > li").filter({ hasText: text }),
  )
  await expect(childList.locator(":scope > li")).toHaveCount(4)
  await Promise.all(caseRows.map((row, index) => expect(row).toHaveText(expectedCases[index])))

  const parentBox = await parentItem.boundingBox()
  const firstCaseBox = await caseRows[0].boundingBox()
  expect(parentBox).not.toBeNull()
  expect(firstCaseBox).not.toBeNull()
  expect(firstCaseBox!.x).toBeGreaterThan(parentBox!.x)

  const rowTops = await Promise.all(
    caseRows.map(row => row.evaluate(element => element.getBoundingClientRect().top)),
  )
  expect(new Set(rowTops).size).toBe(4)
})

test("keeps a real article note on one line inside the 40px margin at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/manual/task-2/articulo-15-06")

  const note = page.locator("[data-margin-note='Art.15']").first()
  const noteBox = await note.boundingBox()

  expect(noteBox).not.toBeNull()
  expect(noteBox?.width).toBeLessThanOrEqual(40)
  expect(noteBox?.height).toBeLessThanOrEqual(19)
  await expect(page.getByRole("heading", { name: "Artículo 15" })).toBeVisible()
})

test("loads every semantic topic route accessibly at 390px", async ({ page }) => {
  test.setTimeout(120_000)
  const browserErrors: string[] = []
  page.on("pageerror", error => browserErrors.push(error.message))
  page.on("console", message => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
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

  expect(browserErrors).toEqual([])
})

test("loads every declared manual figure as a decodable local image", async ({ page }) => {
  await page.goto("/manual")

  const failures = await page.evaluate(async assets => {
    const results = await Promise.all(
      assets.map(
        asset =>
          new Promise<string | null>(resolve => {
            const image = new Image()
            image.addEventListener(
              "load",
              () => resolve(image.naturalWidth > 0 ? null : `${asset.id}: empty image`),
              { once: true },
            )
            image.addEventListener("error", () => resolve(`${asset.id}: ${asset.src}`), {
              once: true,
            })
            image.src = asset.src
          }),
      ),
    )

    return results.filter((result): result is string => result !== null)
  }, manualDraft.assets)

  expect(failures).toEqual([])
})

test("uses a conventional table on wide screens and supports the dark palette", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1000, height: 900 })
  await page.goto("/manual/task-5/educacion-06")

  const article = page.getByRole("article")
  const table = article.getByRole("table")
  const firstCell = table.getByRole("cell").first()

  await expect(table).toHaveCSS("display", "table")
  await expect(firstCell).toHaveCSS("display", "table-cell")

  await page.locator("html").evaluate(element => element.classList.add("dark"))
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(23, 24, 26)")
  await expect(article).toHaveCSS("color", "rgb(232, 231, 224)")
})

test("keeps every population table column visible on wide screens", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto("/manual/task-1/poblacion-14")

  const table = page.getByRole("table", {
    name: "TABLA 2. Número de habitantes por comunidades autónomas",
  })
  const wrapper = table.locator("..")
  const lastPopulatedCell = table.getByRole("cell", { name: "1 568 492" })
  const wrapperBox = await wrapper.boundingBox()
  const cellBox = await lastPopulatedCell.boundingBox()

  expect(wrapperBox).not.toBeNull()
  expect(cellBox).not.toBeNull()
  expect(cellBox!.x + cellBox!.width).toBeLessThanOrEqual(wrapperBox!.x + wrapperBox!.width)
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
  await page.goto("/manual/task-2/articulo-22-11")

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

  await page.goto("/manual/task-2/articulo-22-11")
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

test("keeps faint interactive text legible in the light palette", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/manual")

  const inactivePracticeTab = page.getByRole("link", { name: "Práctica" })
  expect(
    await inactivePracticeTab.evaluate(element => {
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
