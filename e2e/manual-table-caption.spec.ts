import { expect, test } from "@playwright/test"

const CAPTION = "TABLA 8. Sistema educativo español"

test("keeps numbered table captions semantic and visually split at reader widths", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1000, height: 900 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto("/manual/task-5/educacion-06")

    const table = page.getByRole("table", { name: CAPTION })
    const caption = table.locator("caption")
    const prefix = caption.getByText("TABLA 8.", { exact: true })
    const description = caption.getByText("Sistema educativo español", { exact: true })

    await expect(table).toBeVisible()
    await expect(caption).toBeVisible()
    await expect(prefix).toHaveCSS("color", "rgb(165, 28, 48)")
    await expect(description).toHaveCSS("color", "rgb(92, 95, 90)")

    const prefixBox = await prefix.boundingBox()
    const descriptionBox = await description.boundingBox()

    expect(prefixBox).not.toBeNull()
    expect(descriptionBox).not.toBeNull()
    expect(descriptionBox!.y).toBeGreaterThanOrEqual(prefixBox!.y + prefixBox!.height - 1)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true)
  }
})
