import { describe, expect, it } from "vitest"
import { getManualFigureAlt } from "../getManualFigureAlt.ts"

describe("getManualFigureAlt", () => {
  it("uses audited descriptions for standalone visuals with non-descriptive captions", () => {
    expect(getManualFigureAlt("figure-72-family", "© Unsplash")).toBe(
      "Un adulto lleva a un bebé en una mochila portabebés",
    )
    expect(getManualFigureAlt("figure-82-emergency-112", "112")).toBe(
      "Número europeo de emergencias 112 rodeado por estrellas de la Unión Europea",
    )
  })

  it("derives numbered figure alt text from its source caption", () => {
    expect(getManualFigureAlt("figure-70-68", "FIGURA 68. Documento nacional de identidad")).toBe(
      "Documento nacional de identidad",
    )
  })
})
