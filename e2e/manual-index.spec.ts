import { expect, test } from "@playwright/test"
import manualDraft from "../src/manual/manual.draft.json" with { type: "json" }

test("shows every topic and opens a tarea from its heading", async ({ page }) => {
  await page.goto("/manual")

  const navigation = page.getByRole("navigation", { name: "Índice completo del manual" })
  const topicLinks = navigation.locator("ol > li > ol a")
  const expectedTopicCount = manualDraft.sections.reduce(
    (count, section) => count + section.topics.length,
    0,
  )

  await expect(navigation.locator("details")).toHaveCount(0)
  await expect(topicLinks).toHaveCount(expectedTopicCount)
  for (const topicLink of await topicLinks.all()) await expect(topicLink).toBeVisible()

  await page
    .getByRole("link", {
      name: `Tarea 2: ${manualDraft.sections[1].title}`,
    })
    .click()
  await expect(page).toHaveURL(`/manual/${manualDraft.sections[1].id}`)
  await expect(
    page.getByRole("heading", { level: 1, name: manualDraft.sections[1].title }),
  ).toBeVisible()

  await expect(page.getByRole("link", { name: "Buscar en el manual" })).toHaveAttribute(
    "href",
    "/manual/buscar",
  )
})

test("keeps the index and tarea topic lists compact", async ({ page }) => {
  await page.goto("/manual")

  const indexTopicLink = page
    .getByRole("navigation", { name: "Índice completo del manual" })
    .locator("ol > li > ol a")
    .first()
  const indexTopicBox = await indexTopicLink.boundingBox()

  expect(indexTopicBox).not.toBeNull()
  expect(indexTopicBox!.height).toBeLessThanOrEqual(30)

  await page.goto("/manual/task-5")

  const tareaLabel = page.getByText("Tarea 5", { exact: true })
  const tareaTitle = page.getByRole("heading", { level: 1, name: "Sociedad española" })
  const tareaTopicLink = page
    .getByRole("navigation", { name: "Temas de la Tarea 5" })
    .getByRole("link")
    .first()
  const tareaTopicBox = await tareaTopicLink.boundingBox()
  const tareaLabelBox = await tareaLabel.boundingBox()
  const tareaTitleBox = await tareaTitle.boundingBox()

  expect(tareaTopicBox).not.toBeNull()
  expect(tareaTopicBox!.height).toBeLessThanOrEqual(30)
  expect(tareaLabelBox).not.toBeNull()
  expect(tareaTitleBox).not.toBeNull()
  expect(tareaLabelBox!.y + tareaLabelBox!.height).toBeLessThanOrEqual(tareaTitleBox!.y)
  await expect(tareaLabel).toHaveCSS("color", "rgb(165, 28, 48)")
})

test("moves between adjacent tareas from the end of the reader", async ({ page }) => {
  await page.goto("/manual/task-3")

  const navigation = page.getByRole("navigation", {
    name: "Tareas anterior y siguiente",
  })
  const previousLink = navigation.getByRole("link", {
    name: `Tarea anterior: Tarea 2, ${manualDraft.sections[1].title}`,
  })
  const nextLink = navigation.getByRole("link", {
    name: `Tarea siguiente: Tarea 4, ${manualDraft.sections[3].title}`,
  })

  await expect(previousLink).toHaveAttribute("href", "/manual/task-2")
  await nextLink.click()

  await expect(page).toHaveURL("/manual/task-4")
  await expect(
    page.getByRole("heading", { level: 1, name: manualDraft.sections[3].title }),
  ).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})
