import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("Vercel SPA routing", () => {
  it("rewrites only application routes to the shell", () => {
    const configuration = JSON.parse(readFileSync("vercel.json", "utf8"))

    expect(configuration.rewrites).toEqual([
      { source: "/practica", destination: "/index.html" },
      { source: "/manual", destination: "/index.html" },
      { source: "/manual/:sectionId", destination: "/index.html" },
      {
        source: "/manual/:sectionId/:topicSlug",
        destination: "/index.html",
      },
    ])
  })
})
