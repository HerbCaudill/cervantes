import { expect, test } from "@playwright/test"

test("keeps manual figures side by side without duplicated figure metadata", async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto("/manual/task-5/educacion-06")

    const image = page.getByRole("img", {
      name: "Estatua de Fray Luis de León frente a un patio",
    })
    const figure = image.locator("xpath=ancestor::figure")
    const caption = figure.locator("figcaption")

    await image.scrollIntoViewIfNeeded()
    await expect(image).toBeVisible()
    await expect(caption).toHaveText(
      "FIGURA 76. Estatua de Fray Luis de León frente a un patio de la Universidad de Salamanca, la primera institución educativa europea en obtener el título propiamente de Universidad, por la real cédula de Alfonso X el Sabio fechada el 9 de noviembre de 1252. © Victoria Rachitzky",
    )
    await expect(image).toHaveCSS("border-top-width", "0px")
    await expect(page.locator('[data-margin-note="FIGURA 76"]')).toHaveCount(0)

    const imageBox = await image.boundingBox()
    const captionBox = await caption.boundingBox()
    const figureBox = await figure.boundingBox()

    expect(imageBox).not.toBeNull()
    expect(captionBox).not.toBeNull()
    expect(figureBox).not.toBeNull()
    expect(imageBox!.width / figureBox!.width).toBeGreaterThan(0.4)
    expect(imageBox!.width / figureBox!.width).toBeLessThan(0.6)
    expect(captionBox!.x).toBeGreaterThanOrEqual(imageBox!.x + imageBox!.width - 1)
    expect(captionBox!.y).toBeLessThan(imageBox!.y + imageBox!.height)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true)
  }
})
