import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { expect, test } from "@playwright/test"
import { STORAGE_KEY } from "../../src/constants"
import { getManualTopicSlug } from "../../src/manual/getManualTopicSlug"
import manualDraft from "../../src/manual/manual.draft.json" with { type: "json" }
import type { FigureBlock, Manual } from "../../src/manual/types"
import { READER_STATE_STORAGE_KEY } from "../../src/reader/constants"

/** Complete manual compiled into the application bundle. */
const manual = manualDraft as Manual

/** A topic whose lazy figure proves that binary manual assets are available offline. */
const figureLocation = manual.sections
  .flatMap(section => section.topics.map(topic => ({ section, topic })))
  .find(({ topic }) => topic.blocks.some(block => block.type === "figure"))

if (!figureLocation) throw new Error("The manual must contain a topic with a figure")

/** Representative figure block in the selected topic. */
const figureBlock = figureLocation.topic.blocks.find(
  (block): block is FigureBlock => block.type === "figure",
)

if (!figureBlock) throw new Error("The selected topic must contain a figure")

/** Locally bundled asset resolved by the representative figure block. */
const figureAsset = manual.assets.find(asset => asset.id === figureBlock.assetId)

if (!figureAsset) throw new Error(`Missing manual asset ${figureBlock.assetId}`)

/** Semantic route used for offline reload and previous/next navigation. */
const figureTopicPath = `/manual/${figureLocation.section.id}/${getManualTopicSlug(
  figureLocation.section,
  figureLocation.topic,
)}`

test("keeps the complete reader and local state available through offline use and an update", async ({
  page,
}) => {
  const flashcardState = JSON.stringify({
    "offline-sentinel": {
      ease: 2.5,
      interval: 6,
      repetitions: 2,
      dueDate: "2030-01-01T00:00:00.000Z",
    },
  })

  await page.goto(figureTopicPath)
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true)
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, value)
    },
    { key: STORAGE_KEY, value: flashcardState },
  )

  const image = page.getByRole("img", { name: figureAsset.alt }).first()
  await image.scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      image.evaluate(element => {
        const loadedImage = element as HTMLImageElement
        return loadedImage.complete && loadedImage.naturalWidth > 0
      }),
    )
    .toBe(true)
  await expect
    .poll(() =>
      page.evaluate(
        ({ key, topicId }) =>
          JSON.parse(localStorage.getItem(key) ?? "null")?.topics?.[topicId]?.maximumProgress ?? 0,
        {
          key: READER_STATE_STORAGE_KEY,
          topicId: figureLocation.topic.id,
        },
      ),
    )
    .toBeGreaterThan(0)

  await page.context().setOffline(true)
  await page.reload()
  await expect(page.getByRole("article")).toBeVisible()
  await image.scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      image.evaluate(element => {
        const loadedImage = element as HTMLImageElement
        return loadedImage.complete && loadedImage.naturalWidth > 0
      }),
    )
    .toBe(true)

  await page
    .getByRole("navigation", { name: "Temas anterior y siguiente" })
    .getByRole("link", { name: /Siguiente/ })
    .click()
  await expect(page.getByRole("article")).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(figureTopicPath)

  await page.goto("/manual/buscar?q=constitucion")
  await expect(page.getByRole("status")).toContainText(/resultados?/)
  await page.getByRole("list", { name: "Resultados de búsqueda" }).getByRole("link").first().click()
  await expect(page.getByRole("article")).toBeVisible()
  await page.goBack()
  await expect(page.getByRole("searchbox", { name: "Buscar en el manual" })).toHaveValue(
    "constitucion",
  )

  await page.context().setOffline(false)
  const builtIndexPath = resolve("dist/index.html")
  const serviceWorkerPath = resolve("dist/sw.js")
  const updatedIndex = `${readFileSync(builtIndexPath, "utf8")}\n<!-- offline update verification -->\n`
  const updatedIndexRevision = createHash("md5").update(updatedIndex).digest("hex")
  const serviceWorker = readFileSync(serviceWorkerPath, "utf8")
  const updatedServiceWorker = serviceWorker.replace(
    /(\{url:"index\.html",revision:")[^"]+/,
    `$1${updatedIndexRevision}`,
  )
  expect(updatedServiceWorker).not.toBe(serviceWorker)
  writeFileSync(builtIndexPath, updatedIndex)
  writeFileSync(serviceWorkerPath, updatedServiceWorker)
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready
    await new Promise<void>((resolveControllerChange, rejectControllerChange) => {
      const timeout = window.setTimeout(
        () => rejectControllerChange(new Error("Updated service worker did not activate")),
        15_000,
      )
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => {
          window.clearTimeout(timeout)
          resolveControllerChange()
        },
        { once: true },
      )
      void registration.update().catch(rejectControllerChange)
    })
  })

  expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe(flashcardState)
  expect(
    await page.evaluate(
      ({ key, topicId }) =>
        JSON.parse(localStorage.getItem(key) ?? "null")?.topics?.[topicId]?.maximumProgress ?? 0,
      {
        key: READER_STATE_STORAGE_KEY,
        topicId: figureLocation.topic.id,
      },
    ),
  ).toBeGreaterThan(0)

  await page.context().setOffline(true)
  await page.reload()
  await expect(page.getByRole("status")).toContainText(/resultados?/)
  expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe(flashcardState)
})
