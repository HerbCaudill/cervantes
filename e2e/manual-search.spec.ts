import { expect, test } from "@playwright/test"
import { STORAGE_KEY } from "../src/constants"
import manualDraft from "../src/manual/manual.draft.json" with { type: "json" }
import { READER_STATE_STORAGE_KEY } from "../src/reader/constants"

test("searches locally, opens semantic results, and preserves query history", async ({ page }) => {
  const flashcardState = JSON.stringify({ sentinel: { repetitions: 7 } })
  const savedTopicId = manualDraft.sections[0].topics[1].id
  const readerState = JSON.stringify({
    version: 1,
    lastTopicId: savedTopicId,
    topics: {
      [savedTopicId]: {
        scrollPosition: 240,
        maximumProgress: 0.5,
      },
    },
  })
  await page.addInitScript(
    ({ flashcardKey, flashcardValue, readerKey, readerValue }) => {
      localStorage.setItem(flashcardKey, flashcardValue)
      localStorage.setItem(readerKey, readerValue)
    },
    {
      flashcardKey: STORAGE_KEY,
      flashcardValue: flashcardState,
      readerKey: READER_STATE_STORAGE_KEY,
      readerValue: readerState,
    },
  )
  await page.goto("/manual")
  const primaryNavigation = page.getByRole("navigation", { name: "Principal" })
  const searchLink = primaryNavigation.getByRole("link", { name: "Buscar en el manual" })
  await expect(searchLink.locator("svg")).toBeVisible()
  await searchLink.click()

  const input = page.getByRole("searchbox", { name: "Buscar en el manual" })
  await input.fill("  CONSTITUCION   ESPANOLA  ")
  await page.getByRole("button", { name: "Buscar", exact: true }).click()

  await expect(page).toHaveURL("/manual/buscar?q=CONSTITUCION+ESPANOLA")
  await expect(page.getByRole("status")).toContainText(/resultados?/)
  const results = page.getByRole("list", { name: "Resultados de búsqueda" })
  await expect(results.getByRole("link").first()).toHaveAttribute(
    "href",
    /^\/manual\/task-\d#.+-\d{2}$/,
  )
  await expect(
    results
      .locator("mark")
      .filter({ hasText: /constitución/i })
      .first(),
  ).toBeVisible()
  await page.evaluate(() => {
    const observedWindow = window as ManualSearchObservedWindow
    observedWindow.manualSearchPreparationMutations = []
    new MutationObserver(records => {
      for (const record of records) {
        if (record.oldValue?.includes("Preparando búsqueda")) {
          observedWindow.manualSearchPreparationMutations.push(record.oldValue)
        }
        for (const node of record.addedNodes) {
          if (node.textContent?.includes("Preparando búsqueda")) {
            observedWindow.manualSearchPreparationMutations.push(node.textContent)
          }
        }
      }
    }).observe(document.body, {
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true,
    })
  })

  await results.getByRole("link").first().click()
  await expect(page.getByRole("article")).toBeVisible()
  await page.goBack()
  await expect(input).toHaveValue("CONSTITUCION ESPANOLA")
  expect(
    await page.evaluate(
      () => (window as ManualSearchObservedWindow).manualSearchPreparationMutations,
    ),
  ).toEqual([])

  await page.getByRole("button", { name: "Limpiar búsqueda" }).click()
  await expect(page).toHaveURL("/manual/buscar")
  await expect(page.getByRole("list", { name: "Resultados de búsqueda" })).toHaveCount(0)
  await page.goBack()
  await expect(input).toHaveValue("CONSTITUCION ESPANOLA")
  await expect(page.getByRole("status")).toContainText(/resultados?/)

  expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe(flashcardState)
  expect(
    await page.evaluate(
      ({ key, topicId }) =>
        JSON.parse(localStorage.getItem(key) ?? "null")?.topics?.[topicId]?.maximumProgress,
      { key: READER_STATE_STORAGE_KEY, topicId: savedTopicId },
    ),
  ).toBe(0.5)
})

test("keeps search accessible within a 390px viewport in both palettes", async ({ page }) => {
  const browserErrors: string[] = []
  page.on("pageerror", error => browserErrors.push(error.message))
  page.on("console", message => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/manual/buscar?q=constitucion")

  const input = page.getByRole("searchbox", { name: "Buscar en el manual" })
  const searchLink = page
    .getByRole("navigation", { name: "Principal" })
    .getByRole("link", { name: "Buscar en el manual" })
  const searchLinkBox = await searchLink.boundingBox()
  expect(searchLinkBox?.width).toBeGreaterThanOrEqual(44)
  expect(searchLinkBox?.height).toBeGreaterThanOrEqual(44)
  await expect(input).toBeVisible()
  await input.focus()
  await expect(input).toHaveCSS("outline-style", "solid")
  await expect(input).toHaveCSS("outline-width", "2px")
  await expect(input).toHaveCSS("outline-color", "rgb(165, 28, 48)")
  await expect(page.getByRole("status")).toContainText(/resultados?/)
  for (const name of ["Buscar", "Limpiar búsqueda"]) {
    const box = await page.getByRole("button", { name, exact: true }).boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true)

  await page.locator("html").evaluate(element => element.classList.add("dark"))
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(23, 24, 26)")
  await input.focus()
  await expect(input).toHaveCSS("outline-color", "rgb(212, 112, 124)")
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true)
  expect(browserErrors).toEqual([])
})

interface ManualSearchObservedWindow extends Window {
  /** Preparation-state DOM mutations observed after the first completed search */
  manualSearchPreparationMutations: string[]
}
