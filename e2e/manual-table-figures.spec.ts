import { expect, test } from "@playwright/test"

test("keeps row-associated figures inside responsive table cells", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1000, height: 900 },
  ]) {
    await page.setViewportSize(viewport)

    for (const topic of topics) {
      await page.goto(topic.path)

      const article = page.getByRole("article")
      const table = article.getByRole("table", { name: topic.tableName })

      await expect(table).toBeVisible()
      await expect(table.getByRole("figure")).toHaveCount(
        topic.figures.reduce((total, [, figureNumbers]) => total + figureNumbers.length, 0),
      )

      for (const [rowText, figureNumbers] of topic.figures) {
        const row = table.getByRole("row").filter({ hasText: rowText })

        await expect(row).toHaveCount(1)
        await row.scrollIntoViewIfNeeded()
        await expect(row.getByRole("figure")).toHaveCount(figureNumbers.length)

        for (const figureNumber of figureNumbers) {
          const prefix = row.getByText(`FIGURA ${figureNumber}.`, { exact: true })
          const figure = prefix.locator("xpath=ancestor::figure")
          const image = figure.getByRole("img")

          await expect(prefix).toHaveCSS("color", "rgb(165, 28, 48)")
          await expect(image).toBeVisible()
          await expect
            .poll(() =>
              image.evaluate(element => {
                const loadedImage = element as HTMLImageElement
                return loadedImage.complete && loadedImage.naturalWidth > 0
              }),
            )
            .toBe(true)
          await expect(article.getByText(`FIGURA ${figureNumber}.`, { exact: true })).toHaveCount(1)

          if (viewport.width === 390) {
            const cell = figure.locator("xpath=ancestor::td")
            const cellBox = await cell.boundingBox()
            const figureBox = await figure.boundingBox()

            expect(cellBox).not.toBeNull()
            expect(figureBox).not.toBeNull()
            expect(figureBox!.x).toBeGreaterThanOrEqual(cellBox!.x + cellBox!.width * 0.35)
            expect(figureBox!.x + figureBox!.width).toBeLessThanOrEqual(
              cellBox!.x + cellBox!.width + 1,
            )
          }
        }
      }

      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true)
    }
  }
})

/** Manual topics and exact source row associations covered at both reader widths. */
const topics = [
  {
    path: "/manual/task-4#acontecimientos-relevantes-en-la-historia-de-espana-1252-2019-04",
    tableName: "TABLA 5. Acontecimientos relevantes en la historia de España",
    figures: [
      ["1252", [47]],
      ["1492", [48]],
      ["Siglos XVI-XVII", [49]],
      ["1936-1939", [50, 51]],
      ["1939-1975", [52]],
      ["1978", [53]],
      ["1992", [54]],
    ],
  },
  {
    path: "/manual/task-4#fiestas-celebraciones-y-folclore-05",
    tableName: "TABLA 6. Fiestas españolas más conocidas",
    figures: [
      ["Fallas de Valencia", [55]],
      ["Semana Santa", [58]],
      ["Sant Jordi", [59]],
      ["La Tomatina", [60]],
      ["Sanfermines", [61]],
    ],
  },
  {
    path: "/manual/task-5#educacion-06",
    tableName: "TABLA 8. Sistema educativo español",
    figures: [["Educación Infantil", [75]]],
  },
] as const
