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

/** Topics whose figures exercise online state and independent offline provenance. */
const figureLocations = manual.sections
  .flatMap(section => section.topics.map(topic => ({ section, topic })))
  .filter(({ topic }) => topic.blocks.some(block => block.type === "figure"))

if (figureLocations.length < 2)
  throw new Error("The manual must contain at least two figure topics")

/** Online topic used to create representative reader progress. */
const onlineFigureLocation = figureLocations[0]

/** Independent topic whose figure has never been requested by a page before offline mode. */
const offlineFigureLocation = figureLocations.at(-1)!

/** Figure block requested only after Chromium's HTTP cache has been cleared. */
const offlineFigureBlock = offlineFigureLocation.topic.blocks.find(
  (block): block is FigureBlock => block.type === "figure",
)

if (!offlineFigureBlock) throw new Error("The offline topic must contain a figure")

/** Locally bundled asset whose response must come from the service worker. */
const offlineFigureAsset = manual.assets.find(asset => asset.id === offlineFigureBlock.assetId)

if (!offlineFigureAsset) throw new Error(`Missing manual asset ${offlineFigureBlock.assetId}`)

/** Online semantic route used to create reader state before losing the network. */
const onlineFigureTopicPath = `/manual/${onlineFigureLocation.section.id}#${getManualTopicSlug(
  onlineFigureLocation.section,
  onlineFigureLocation.topic,
)}`

/** Independent semantic route loaded only after losing the network. */
const offlineFigureTopicPath = `/manual/${offlineFigureLocation.section.id}#${getManualTopicSlug(
  offlineFigureLocation.section,
  offlineFigureLocation.topic,
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

  await page.goto(onlineFigureTopicPath)
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

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect
    .poll(() =>
      page.evaluate(
        ({ key, topicId }) =>
          JSON.parse(localStorage.getItem(key) ?? "null")?.topics?.[topicId]?.maximumProgress ?? 0,
        {
          key: READER_STATE_STORAGE_KEY,
          topicId: onlineFigureLocation.topic.id,
        },
      ),
    )
    .toBeGreaterThan(0)

  const cdpSession = await page.context().newCDPSession(page)
  await cdpSession.send("Network.enable")
  await cdpSession.send("Network.clearBrowserCache")
  await cdpSession.detach()
  const offlineImageResponse = page.waitForResponse(
    response => new URL(response.url()).pathname === offlineFigureAsset.src,
  )
  await page.context().setOffline(true)
  await page.goto(offlineFigureTopicPath)
  await expect(page.getByRole("article")).toBeVisible()
  const offlineImage = page.getByRole("img", { name: offlineFigureAsset.alt }).first()
  await offlineImage.scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      offlineImage.evaluate(element => {
        const loadedImage = element as HTMLImageElement
        return loadedImage.complete && loadedImage.naturalWidth > 0
      }),
    )
    .toBe(true)
  expect((await offlineImageResponse).fromServiceWorker()).toBe(true)

  await page
    .getByRole("navigation", { name: /Temas de la Tarea/ })
    .getByRole("link")
    .first()
    .click()
  await expect(page.getByRole("article")).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(offlineFigureTopicPath)

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
        topicId: onlineFigureLocation.topic.id,
      },
    ),
  ).toBeGreaterThan(0)

  await page.context().setOffline(true)
  await page.reload()
  await expect(page.getByRole("status")).toContainText(/resultados?/)
  expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe(flashcardState)
})

test("never serves the application shell for excluded navigations", async ({ context, page }) => {
  await page.goto("/")
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true)
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await context.setOffline(true)

  for (const path of [
    "/api",
    "/api/",
    "/api?x=1",
    "/api/thing",
    "/assets/does-not-exist.js",
    "/.git/config",
  ]) {
    const apiPage = await context.newPage()
    await expect(apiPage.goto(path)).rejects.toThrow(/ERR_INTERNET_DISCONNECTED/)
    await apiPage.close()
  }
})
