import { expect, test } from "@playwright/test"

test("uses white light paper while preserving the dark palette", async ({ page }) => {
  await page.goto("/manual/buscar")

  const body = page.locator("body")
  const application = page.locator("#root > div")
  const heading = page.getByRole("heading", { name: "Buscar en el manual" })
  const backLink = page.getByRole("link", { name: "← Índice del manual" })
  const searchInput = page.getByRole("searchbox", { name: "Buscar en el manual" })
  const searchButton = page.getByRole("button", { name: "Buscar" })

  await expect(body).toHaveCSS("background-color", "rgb(255, 255, 255)")
  await expect(application).toHaveCSS("background-color", "rgb(255, 255, 255)")
  await expect(heading).toHaveCSS("color", "rgb(20, 22, 26)")
  await expect(backLink).toHaveCSS("color", "rgb(92, 95, 90)")
  await expect(heading).toHaveCSS("border-bottom-color", "rgb(168, 168, 158)")
  await expect(searchInput).toHaveCSS("background-color", "rgb(255, 255, 255)")
  await expect(searchButton).toHaveCSS("background-color", "rgb(20, 22, 26)")
  await expect(searchButton).toHaveCSS("color", "rgb(255, 255, 255)")

  await page.locator("html").evaluate(element => element.classList.add("dark"))

  await expect(body).toHaveCSS("background-color", "rgb(23, 24, 26)")
  await expect(application).toHaveCSS("background-color", "rgb(23, 24, 26)")
  await expect(heading).toHaveCSS("color", "rgb(232, 231, 224)")
  await expect(backLink).toHaveCSS("color", "rgb(163, 164, 157)")
  await expect(heading).toHaveCSS("border-bottom-color", "rgb(101, 103, 106)")
  await expect(searchInput).toHaveCSS("background-color", "rgb(23, 24, 26)")
  await expect(searchButton).toHaveCSS("background-color", "rgb(232, 231, 224)")
  await expect(searchButton).toHaveCSS("color", "rgb(23, 24, 26)")
})

test("blends white-backed manual figures into the light paper", async ({ page }) => {
  await page.goto("/manual/task-5#educacion-06")

  const application = page.locator("#root > div")
  const image = page
    .getByRole("heading", { name: "Educación", exact: true })
    .locator("..")
    .getByRole("img")
    .first()

  await expect(image).toBeVisible()
  await expect(application).toHaveCSS("background-color", "rgb(255, 255, 255)")
  await expect(image).toHaveCSS("background-color", "rgb(255, 255, 255)")
})
