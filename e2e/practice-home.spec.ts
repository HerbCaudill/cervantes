import { expect, test } from "@playwright/test"
import questionBank from "../src/data/questions.json" with { type: "json" }

test.describe("practice landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ({ questions }) => {
        const states = Object.fromEntries(
          questions.map(({ id }, index) => [
            id,
            {
              questionId: id,
              repetitions: 1,
              easeFactor: 2.5,
              interval: 1,
              due: index === 0 ? "2000-01-01T12:00:00.000Z" : "2100-01-01T12:00:00.000Z",
            },
          ]),
        )
        localStorage.setItem("ccse-flashcards:states", JSON.stringify(states))
      },
      { questions: questionBank },
    )
  })

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
  ]) {
    test(`centers the review action and anchors the card table at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.goto("/")

      const startReview = page.getByRole("button", { name: "Empezar repaso" })
      const navigation = page.getByRole("navigation", { name: "Principal" })
      const table = page.getByRole("table")
      const tableHead = table.locator("thead")

      await expect(startReview).toBeVisible()
      await expect(tableHead.getByRole("columnheader", { name: "Pendiente" })).toBeVisible()
      await expect(tableHead.getByRole("columnheader", { name: "Total" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Seguir leyendo" })).toHaveCount(0)

      const startBox = await startReview.boundingBox()
      const navigationBox = await navigation.boundingBox()
      const tableBox = await table.boundingBox()
      expect(startBox).not.toBeNull()
      expect(navigationBox).not.toBeNull()
      expect(tableBox).not.toBeNull()
      if (!startBox || !navigationBox || !tableBox) return

      expect(startBox.width).toBeLessThan(tableBox.width)
      expect(
        Math.abs(startBox.x + startBox.width / 2 - (tableBox.x + tableBox.width / 2)),
      ).toBeLessThan(2)
      expect(
        Math.abs(
          startBox.y +
            startBox.height / 2 -
            (navigationBox.y + navigationBox.height + tableBox.y) / 2,
        ),
      ).toBeLessThan(2)
      expect(viewport.height - (tableBox.y + tableBox.height)).toBeLessThanOrEqual(20)

      await startReview.click()
      const progress = page.getByRole("progressbar", { name: "Progreso del repaso" })
      await expect(progress).toBeVisible()
      await expect(progress).toHaveAttribute("aria-valuenow", "0")
      await expect(progress).toHaveAttribute("aria-valuemax", "1")

      const progressBox = await progress.boundingBox()
      expect(progressBox).not.toBeNull()
      if (!progressBox) return

      expect(progressBox.height).toBeGreaterThanOrEqual(8)
      expect(progressBox.width).toBeGreaterThan(300)
    })
  }
})

test("disables review when no cards are pending", async ({ page }) => {
  await page.addInitScript(
    ({ questions }) => {
      const states = Object.fromEntries(
        questions.map(({ id }) => [
          id,
          {
            questionId: id,
            repetitions: 1,
            easeFactor: 2.5,
            interval: 1,
            due: "2100-01-01T12:00:00.000Z",
          },
        ]),
      )
      localStorage.setItem("ccse-flashcards:states", JSON.stringify(states))
    },
    { questions: questionBank },
  )

  await page.goto("/")

  await expect(page.getByRole("button", { name: "No hay preguntas pendientes" })).toBeDisabled()
})
