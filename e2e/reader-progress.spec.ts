import { expect, test } from "@playwright/test"
import manualDraft from "../src/manual/manual.draft.json" with { type: "json" }
import { getManualTopicSlug } from "../src/manual/getManualTopicSlug"
import type { Manual } from "../src/manual/types"
import { READER_STATE_STORAGE_KEY, READER_STATE_VERSION } from "../src/reader/constants"
import type { ReaderState } from "../src/reader/types"
import { STORAGE_KEY } from "../src/constants"

const manual = manualDraft as Manual
const section = manual.sections[0]
const firstTopic = section.topics[0]
const secondTopic = section.topics[1]
const firstTopicPath = `/manual/${section.id}#${getManualTopicSlug(section, firstTopic)}`
const secondTopicPath = `/manual/${section.id}#${getManualTopicSlug(section, secondTopic)}`

test("persists a topic after navigation and reload without touching flashcard state", async ({
  page,
}) => {
  const flashcardState = JSON.stringify({ sentinel: { repetitions: 7 } })
  await page.setViewportSize({ width: 390, height: 500 })
  await page.goto("/")
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: STORAGE_KEY,
    value: flashcardState,
  })
  await page.goto(firstTopicPath)
  await expect(page.getByRole("article")).toBeVisible()
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await page
    .getByRole("navigation", { name: "Temas de la Tarea 1" })
    .getByRole("link", { name: secondTopic.title })
    .click()
  await expect(page).toHaveURL(secondTopicPath)
  await expect
    .poll(() =>
      page.evaluate(
        ({ key, topicId }) =>
          JSON.parse(localStorage.getItem(key) ?? "null")?.topics?.[topicId]?.scrollPosition ??
          null,
        { key: READER_STATE_STORAGE_KEY, topicId: secondTopic.id },
      ),
    )
    .toBeGreaterThan(0)
  await expect
    .poll(() =>
      page.evaluate(
        key => JSON.parse(localStorage.getItem(key) ?? "null")?.lastTopicId ?? null,
        READER_STATE_STORAGE_KEY,
      ),
    )
    .toBe(secondTopic.id)
  await expect
    .poll(() =>
      page.evaluate(
        key => JSON.parse(localStorage.getItem(key) ?? "null")?.topics ?? null,
        READER_STATE_STORAGE_KEY,
      ),
    )
    .toHaveProperty(secondTopic.id)

  await page.evaluate(() => {
    window.history.pushState(null, "", "/manual")
    window.dispatchEvent(
      new CustomEvent("cervantes:navigate", {
        detail: { scroll: "top" },
      }),
    )
  })
  await expect(page).toHaveURL("/manual")
  await expect(page.getByRole("link", { name: "Seguir leyendo" })).toHaveCount(0)
  await page.locator(`a[href="${secondTopicPath}"]`).click()
  await expect(page).toHaveURL(secondTopicPath)
  await expect(page.getByRole("heading", { name: secondTopic.title })).toBeInViewport()

  await page.reload()
  await expect(page.getByRole("heading", { name: secondTopic.title })).toBeInViewport()
  expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe(flashcardState)
})

test("starts safely when reader storage is corrupt", async ({ page }) => {
  const pageErrors: Error[] = []
  page.on("pageerror", error => pageErrors.push(error))
  await page.addInitScript(key => localStorage.setItem(key, "{"), READER_STATE_STORAGE_KEY)
  await page.goto("/manual")

  await expect(page.getByRole("link", { name: "Seguir leyendo" })).toHaveCount(0)
  await page.goto(firstTopicPath)
  await expect(page.getByRole("article")).toBeVisible()
  expect(pageErrors).toEqual([])
})

test("keeps same-page topic anchors coherent through browser history", async ({ page }) => {
  await page.goto(firstTopicPath)
  await page
    .getByRole("navigation", { name: "Temas de la Tarea 1" })
    .getByRole("link", { name: secondTopic.title })
    .click()
  await expect(page).toHaveURL(secondTopicPath)
  await expect(page.getByRole("heading", { name: secondTopic.title })).toBeInViewport()

  await page.goBack()
  await expect(page).toHaveURL(firstTopicPath)
  await expect(page.getByRole("heading", { name: firstTopic.title })).toBeInViewport()
})

test("keeps progress screens within a 390px viewport in both palettes", async ({ page }) => {
  const browserErrors: string[] = []
  page.on("pageerror", error => browserErrors.push(error.message))
  page.on("console", message => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
  const state: ReaderState = {
    version: READER_STATE_VERSION,
    lastTopicId: firstTopic.id,
    topics: {
      [firstTopic.id]: {
        scrollPosition: 240,
        maximumProgress: 0.5,
      },
    },
  }
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: READER_STATE_STORAGE_KEY,
    value: JSON.stringify(state),
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/manual")

  await expect(page.getByRole("link", { name: "Seguir leyendo" })).toHaveCount(0)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true)

  await page.locator("html").evaluate(element => element.classList.add("dark"))
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(23, 24, 26)")
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
