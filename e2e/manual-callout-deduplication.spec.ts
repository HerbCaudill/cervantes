import { expect, test } from "@playwright/test"

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
