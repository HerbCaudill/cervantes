import { expect, test } from "@playwright/test"

test("loads every verified Task 4 topic and source figure at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })

  const topics = [
    [
      "/manual/task-4#literatura-musica-y-artes-escenicas-01",
      "LITERATURA, MÚSICA Y ARTES ESCÉNICAS",
      7,
    ],
    ["/manual/task-4#arquitectura-y-artes-plasticas-02", "ARQUITECTURA Y ARTES PLÁSTICAS", 20],
    ["/manual/task-4#ciencia-y-tecnologia-03", "CIENCIA Y TECNOLOGÍA", 1],
    [
      "/manual/task-4#acontecimientos-relevantes-en-la-historia-de-espana-1252-2019-04",
      "ACONTECIMIENTOS RELEVANTES EN LA HISTORIA DE ESPAÑA (1252-2019)",
      8,
    ],
    ["/manual/task-4#fiestas-celebraciones-y-folclore-05", "FIESTAS, CELEBRACIONES Y FOLCLORE", 7],
    [
      "/manual/task-4#acontecimientos-culturales-y-deportivos-06",
      "ACONTECIMIENTOS CULTURALES Y DEPORTIVOS",
      4,
    ],
    ["/manual/task-4#deportes-07", "DEPORTES", 2],
  ] as const

  for (const [url, heading, figureCount] of topics) {
    await page.goto(url)

    const article = page.getByRole("article")
    const topic = article.getByRole("heading", { level: 2, name: heading }).locator("..")
    const images = topic.getByRole("img")

    await expect(topic.getByRole("heading", { level: 2, name: heading })).toBeVisible()
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

test("renders each reconstructed multi-page Task 4 table", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })

  await page.goto("/manual/task-4#acontecimientos-relevantes-en-la-historia-de-espana-1252-2019-04")
  const history = page.getByRole("table", {
    name: "TABLA 5. Acontecimientos relevantes en la historia de España",
  })
  await expect(history.getByRole("cell", { name: "Fecha 1252", exact: true })).toBeAttached()
  await expect(history.getByRole("cell", { name: "Fecha 2014", exact: true })).toBeAttached()

  await page.goto("/manual/task-4#fiestas-celebraciones-y-folclore-05")
  const fiestas = page.getByRole("table", {
    name: "TABLA 6. Fiestas españolas más conocidas",
  })
  await expect(fiestas.getByRole("cell", { name: "Fiestas Navidades" })).toBeAttached()
  await expect(fiestas.getByRole("cell", { name: "Fiestas La Tomatina" })).toBeAttached()

  await page.goto("/manual/task-4#acontecimientos-culturales-y-deportivos-06")
  const nobel = page.getByRole("table", {
    name: "TABLA 7. Españoles galardonados con el premio Nobel",
  })
  await expect(nobel.getByRole("cell", { name: "Fecha y localidad José Echegaray" })).toBeAttached()
  await expect(
    nobel.getByRole("cell", { name: "Fecha y localidad Mario Vargas Llosa" }),
  ).toBeAttached()
})
