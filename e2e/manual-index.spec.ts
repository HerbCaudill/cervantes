import { expect, test } from "@playwright/test"
import manualDraft from "../src/manual/manual.draft.json" with { type: "json" }

test("opens every tarea while keeping each one collapsible", async ({ page }) => {
  await page.goto("/manual")

  const navigation = page.getByRole("navigation", { name: "Índice completo del manual" })
  const tareas = navigation.locator("details")
  const topicLinks = navigation.locator("details > ol a")
  const expectedTopicCount = manualDraft.sections.reduce(
    (count, section) => count + section.topics.length,
    0,
  )

  await expect(tareas).toHaveCount(manualDraft.sections.length)
  await expect(topicLinks).toHaveCount(expectedTopicCount)
  for (const tarea of await tareas.all()) await expect(tarea).toHaveAttribute("open", "")
  for (const topicLink of await topicLinks.all()) await expect(topicLink).toBeVisible()

  const secondTarea = tareas.nth(1)
  const secondTareaSummary = secondTarea.locator("summary")
  const secondTareaFirstTopic = secondTarea.locator("ol a").first()

  await secondTareaSummary.click()
  await expect(secondTarea).not.toHaveAttribute("open", "")
  await expect(secondTareaFirstTopic).not.toBeVisible()

  await secondTareaSummary.click()
  await expect(secondTarea).toHaveAttribute("open", "")
  await expect(secondTareaFirstTopic).toBeVisible()

  await expect(page.getByRole("link", { name: "Buscar en el manual" })).toHaveAttribute(
    "href",
    "/manual/buscar",
  )
})
