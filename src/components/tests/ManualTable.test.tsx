import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ManualTable } from "@/components/ManualTable"
import type { TableBlock } from "@/manual/types"

describe("ManualTable", () => {
  it("shows a numbered caption as a separate prefix and description while retaining its accessible name", () => {
    render(<ManualTable block={createTableBlock("TABLA 12. Descripción completa de la tabla")} />)

    const table = screen.getByRole("table", {
      name: "TABLA 12. Descripción completa de la tabla",
    })

    expect(within(table).getByText("TABLA 12.", { exact: true })).toBeInTheDocument()
    expect(
      within(table).getByText("Descripción completa de la tabla", { exact: true }),
    ).toBeInTheDocument()
  })

  it("normalizes a missing prefix period without changing the full accessible caption", () => {
    render(<ManualTable block={createTableBlock("TABLA 4 Comunidades autónomas y capitales")} />)

    const table = screen.getByRole("table", {
      name: "TABLA 4 Comunidades autónomas y capitales",
    })

    expect(within(table).getByText("TABLA 4.", { exact: true })).toBeInTheDocument()
    expect(
      within(table).getByText("Comunidades autónomas y capitales", { exact: true }),
    ).toBeInTheDocument()
  })

  it("retains an unexpectedly formatted caption without losing its accessible text", () => {
    const caption = "Resumen de magnitudes (edición revisada)"
    render(<ManualTable block={createTableBlock(caption)} />)

    const table = screen.getByRole("table", { name: caption })

    expect(within(table).getByText(caption, { exact: true })).toBeInTheDocument()
  })
})

/** Create the smallest valid table block needed by caption rendering tests. */
function createTableBlock(caption: string): TableBlock {
  return {
    type: "table",
    caption,
    headers: ["Columna"],
    rows: [["Valor"]],
  }
}
