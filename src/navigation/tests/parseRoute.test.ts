import { describe, expect, it } from "vitest"
import { parseRoute } from "@/navigation/parseRoute"

describe("parseRoute", () => {
  it("retains a decoded manual search query in the search route", () => {
    expect(parseRoute("/manual/buscar?q=constituci%C3%B3n+espa%C3%B1ola")).toEqual({
      type: "manual-search",
      query: "constitución española",
    })
  })

  it("recognizes a tarea reader route while ignoring its topic anchor", () => {
    expect(parseRoute("/manual/task-1#poderes-del-estado-gobierno-e-instituciones-01")).toEqual({
      type: "manual-section",
      sectionId: "task-1",
    })
  })

  it("does not recognize removed standalone topic routes", () => {
    expect(parseRoute("/manual/task-1/poderes-del-estado-gobierno-e-instituciones-01")).toEqual({
      type: "not-found",
    })
  })
})
