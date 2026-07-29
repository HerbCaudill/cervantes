import { expect, test } from "@playwright/test"

test("left-aligns intrinsically sized manual figures beside three-line captions", async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto("/manual/task-5#servicios-sociales-y-programas-de-ayuda-08")

    const image = page.getByRole("img", {
      name: "Logotipo de la Organización Nacional de Ciegos Españoles",
    })
    const figure = image.locator("xpath=ancestor::figure")
    const caption = figure.locator("figcaption")
    const prefix = caption.getByText("FIGURA 81.", { exact: true })
    const description = caption.getByText(
      "Logotipo de la Organización Nacional de Ciegos Españoles (ONCE), organización no gubernamental que trabaja para conseguir la integración de las personas con discapacidad visual y colabora en la atención y defensa de los derechos de las personas con distintos tipos de discapacidad.",
      { exact: true },
    )
    const credit = caption.getByText("© ONCE", { exact: true })
    const readingContent = page
      .getByRole("heading", {
        name: "Servicios sociales y programas de ayuda",
        exact: true,
      })
      .locator("..")

    await image.scrollIntoViewIfNeeded()
    await expect(image).toBeVisible()
    await expect(caption).toHaveText(
      "FIGURA 81. Logotipo de la Organización Nacional de Ciegos Españoles (ONCE), organización no gubernamental que trabaja para conseguir la integración de las personas con discapacidad visual y colabora en la atención y defensa de los derechos de las personas con distintos tipos de discapacidad. © ONCE",
    )
    await expect(prefix).toBeVisible()
    await expect(description).toBeVisible()
    await expect(credit).toBeVisible()
    await expect(image).toHaveCSS("border-top-width", "0px")

    const imageBox = await image.boundingBox()
    const captionBox = await caption.boundingBox()
    const figureBox = await figure.boundingBox()
    const prefixBox = await prefix.boundingBox()
    const descriptionBox = await description.boundingBox()
    const creditBox = await credit.boundingBox()
    const readingContentBox = await readingContent.boundingBox()
    const naturalWidth = await image.evaluate(element => element.naturalWidth)
    const descriptionColor = await description.evaluate(element => getComputedStyle(element).color)
    const creditColor = await credit.evaluate(element => getComputedStyle(element).color)

    expect(imageBox).not.toBeNull()
    expect(captionBox).not.toBeNull()
    expect(figureBox).not.toBeNull()
    expect(prefixBox).not.toBeNull()
    expect(descriptionBox).not.toBeNull()
    expect(creditBox).not.toBeNull()
    expect(readingContentBox).not.toBeNull()
    expect(figureBox!.x).toBeCloseTo(readingContentBox!.x, 0)
    expect(imageBox!.width).toBeLessThanOrEqual(naturalWidth + 0.5)
    expect(imageBox!.width).toBeLessThanOrEqual(figureBox!.width / 2 + 0.5)
    expect(captionBox!.x).toBeGreaterThanOrEqual(imageBox!.x + imageBox!.width - 1)
    expect(captionBox!.y).toBeLessThan(imageBox!.y + imageBox!.height)
    expect(descriptionBox!.y).toBeGreaterThanOrEqual(prefixBox!.y + prefixBox!.height - 1)
    expect(creditBox!.y).toBeGreaterThanOrEqual(descriptionBox!.y + descriptionBox!.height - 1)
    expect(creditColor).not.toBe(descriptionColor)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true)
  }
})

test("renders manual figure captions without a rule", async ({ page }) => {
  await page.goto("/manual/task-5#servicios-sociales-y-programas-de-ayuda-08")

  const caption = page
    .getByRole("img", {
      name: "Logotipo de la Organización Nacional de Ciegos Españoles",
    })
    .locator("xpath=ancestor::figure")
    .locator("figcaption")

  await expect(caption).toHaveCSS("border-bottom-width", "0px")
})
