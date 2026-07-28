import { expect, test } from "@playwright/test"
import { getManualBodyTextIndex } from "../src/manual/getManualBodyTextIndex"
import { getManualTopicSlug } from "../src/manual/getManualTopicSlug"
import { getVisibleManualBlocks } from "../src/manual/getVisibleManualBlocks"
import manualDraft from "../src/manual/manual.draft.json" with { type: "json" }
import { getManualBlockSearchSegments } from "../src/manual/search/getManualBlockSearchSegments"
import type { Manual } from "../src/manual/types"

const manual = manualDraft as Manual
const bodyTextIndex = getManualBodyTextIndex(manual)

test("renders the Felipe VI prose once and loads its figure at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/manual/task-1/poderes-del-estado-gobierno-e-instituciones-01")

  const article = page.getByRole("article")
  const repeatedText =
    "El rey de España es el jefe del Estado, tiene la máxima representación. Su papel consiste en actuar como mediador y garantizar el buen funcionamiento de las instituciones."
  const image = article.getByRole("img", {
    name: "Su Majestad el rey Felipe VI",
  })

  await expect(article.getByText(repeatedText, { exact: false })).toHaveCount(1)
  await expect
    .poll(() =>
      image.evaluate(element => {
        const loadedImage = element as HTMLImageElement
        return loadedImage.complete && loadedImage.naturalWidth > 0
      }),
    )
    .toBe(true)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true)
})

test("renders the audited projection on every source callout route", async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 390, height: 844 })

  for (const section of manual.sections) {
    for (const topic of section.topics) {
      if (!topic.blocks.some(block => block.type === "callout")) continue

      const expectedCallouts = getVisibleManualBlocks(manual, topic.blocks, bodyTextIndex).filter(
        block => block.type === "callout",
      )
      await page.goto(`/manual/${section.id}/${getManualTopicSlug(section, topic)}`)

      const notes = page.getByRole("article").getByRole("note")
      await expect(notes).toHaveCount(expectedCallouts.length)
      for (const [index, expectedCallout] of expectedCallouts.entries()) {
        const noteText = await notes.nth(index).textContent()
        for (const segment of getManualBlockSearchSegments(expectedCallout)) {
          expect(noteText).toContain(segment)
        }
      }
    }
  }
})
