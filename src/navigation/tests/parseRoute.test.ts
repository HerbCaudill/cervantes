import { describe, expect, it } from "vitest"
import { parseRoute } from "@/navigation/parseRoute"

describe("parseRoute", () => {
  it("retains a decoded manual search query in the search route", () => {
    expect(parseRoute("/manual/buscar?q=constituci%C3%B3n+espa%C3%B1ola")).toEqual({
      type: "manual-search",
      query: "constitución española",
    })
  })

  it("ignores unrelated query parameters on manual routes", () => {
    expect(parseRoute("/manual/task-1?from=search")).toEqual({
      type: "manual-section",
      sectionId: "task-1",
    })
  })
})
