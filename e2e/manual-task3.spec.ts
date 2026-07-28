import { expect, test } from "@playwright/test"

test("loads every verified Task 3 topic and source figure at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })

  const topics = [
    ["/manual/task-3/geografia-fisica-y-politica-01", "GEOGRAFÍA FÍSICA Y POLÍTICA", 1],
    [
      "/manual/task-3/accidentes-geograficos-mas-importantes-de-espana-02",
      "Accidentes geográficos más importantes de España",
      4,
    ],
    ["/manual/task-3/el-clima-03", "El clima", 2],
    ["/manual/task-3/division-territorial-de-espana-04", "División territorial de España", 8],
  ] as const

  for (const [url, heading, figureCount] of topics) {
    await page.goto(url)

    const article = page.getByRole("article")
    const images = article.getByRole("img")

    await expect(article.getByRole("heading", { level: 2, name: heading })).toBeVisible()
    await expect(images).toHaveCount(figureCount)
    for (let index = 0; index < figureCount; index += 1) {
      const image = images.nth(index)
      await image.scrollIntoViewIfNeeded()
      await expect
        .poll(() =>
          image.evaluate(element => {
            const loadedImage = element as HTMLImageElement
            return loadedImage.complete && loadedImage.naturalWidth > 0
          }),
        )
        .toBe(true)
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true)
  }
})

test("renders the complete Task 3 geographic table on its semantic route", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/manual/task-3/division-territorial-de-espana-04")

  const table = page.getByRole("table", {
    name: "TABLA 4 Comunidades autónomas, provincias, capitales de provincia y capitales de comunidades autónomas",
  })

  await expect(table.getByRole("columnheader", { name: "Comunidades autónomas" })).toBeAttached()
  await expect(table.getByRole("cell", { name: "Andalucía" })).toBeAttached()
  await expect(table.getByRole("cell", { name: "Melilla" })).toBeAttached()
  await expect(page.getByText(/^1 En el Estatuto de Autonomía/)).toBeAttached()
})
