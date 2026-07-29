import { describe, expect, it } from "vitest"
import { normalizePopulationTableBlock } from "../normalizePopulationTableBlock.ts"
import type { DraftTableBlock } from "../types.ts"

describe("normalizePopulationTableBlock", () => {
  it("flattens population column pairs in source reading order", () => {
    const table: DraftTableBlock = {
      type: "table",
      caption: "TABLA 2. Número de habitantes por comunidades autónomas",
      headers: [
        "Comunidades y ciudades autónomas",
        "Población",
        "Comunidades y ciudades autónomas",
        "Población",
        "Comunidades y ciudades autónomas",
        "Población",
      ],
      rows: [
        ["Andalucía", "8 631 862", "Castilla - La Mancha", "2 104 433", "Murcia", "1 568 492"],
        ["Aragón", "1 351 591", "Cataluña", "8 012 231", "Navarra", "678 333"],
        ["Principado de Asturias", "1 009 599", "Ceuta", "83 179", "País Vasco", "2 227 684"],
        ["Islas Baleares", "1 231 768", "Extremadura", "1 054 681", "La Rioja", "324 182"],
        ["Canarias", "2 238 754", "Galicia", "2 705 833", "Comunidad Valencia", "5 319 285"],
        ["Cantabria", "590 851", "Madrid", "7 009 268", null, null],
        ["Castilla y León", "2 391 682", "Melilla", "85 985", null, null],
      ].map(row => row.map(text => ({ text }))),
    }

    expect(normalizePopulationTableBlock(table)).toEqual({
      type: "table",
      caption: "TABLA 2. Número de habitantes por comunidades autónomas",
      headers: ["Comunidades y ciudades autónomas", "Población"],
      rows: [
        ["Andalucía", "8 631 862"],
        ["Aragón", "1 351 591"],
        ["Principado de Asturias", "1 009 599"],
        ["Islas Baleares", "1 231 768"],
        ["Canarias", "2 238 754"],
        ["Cantabria", "590 851"],
        ["Castilla y León", "2 391 682"],
        ["Castilla - La Mancha", "2 104 433"],
        ["Cataluña", "8 012 231"],
        ["Ceuta", "83 179"],
        ["Extremadura", "1 054 681"],
        ["Galicia", "2 705 833"],
        ["Madrid", "7 009 268"],
        ["Melilla", "85 985"],
        ["Murcia", "1 568 492"],
        ["Navarra", "678 333"],
        ["País Vasco", "2 227 684"],
        ["La Rioja", "324 182"],
        ["Comunidad Valencia", "5 319 285"],
      ].map(row => row.map(text => ({ text }))),
    })
  })

  it("leaves other tables unchanged", () => {
    const table: DraftTableBlock = {
      type: "table",
      caption: "TABLA 3. Otro contenido",
      headers: ["Comunidad", "Población", "Comunidad", "Población"],
      rows: [["Andalucía", "8 631 862", "Aragón", "1 351 591"].map(text => ({ text }))],
    }

    expect(normalizePopulationTableBlock(table)).toBe(table)
  })
})
