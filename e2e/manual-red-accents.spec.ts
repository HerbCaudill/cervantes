import { expect, test } from "@playwright/test"

const FIGURE_CAPTION =
  "FIGURA 76. Estatua de Fray Luis de León frente a un patio de la Universidad de Salamanca, la primera institución educativa europea en obtener el título propiamente de Universidad, por la real cédula de Alfonso X el Sabio fechada el 9 de noviembre de 1252. © Victoria Rachitzky"

test("uses the reader red accent for wide table headings and figure numbers", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 900 })
  await page.goto("/manual/task-5#educacion-06")

  const table = page.getByRole("table")
  const heading = table.getByRole("columnheader", { name: "Nivel educativo" })
  const caption = page.getByRole("figure").filter({ hasText: "FIGURA 76." }).locator("figcaption")
  const figureNumber = caption.getByText("FIGURA 76.", { exact: true })

  await expect(heading).toHaveCSS("color", "rgb(165, 28, 48)")
  await expect(caption).toHaveText(FIGURE_CAPTION)
  await expect(caption).toHaveCSS("color", "rgb(92, 95, 90)")
  await expect(figureNumber).toHaveCSS("color", "rgb(165, 28, 48)")
})

test("uses the reader red accent for narrow responsive table labels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/manual/task-4#fiestas-celebraciones-y-folclore-05")

  const table = page.getByRole("table")
  const firstCell = table.getByRole("cell").first()
  const responsiveLabelColor = await firstCell.evaluate(
    element => getComputedStyle(element, "::before").color,
  )

  expect(responsiveLabelColor).toBe("rgb(165, 28, 48)")
  await expect(table.getByRole("columnheader", { name: "Fiestas", exact: true })).toBeAttached()
})
