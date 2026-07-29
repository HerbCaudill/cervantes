import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ManualTable } from "@/components/ManualTable"
import type { ManualAsset, TableBlock } from "@/manual/types"

describe("ManualTable", () => {
  it("shows a numbered caption as a separate prefix and description while retaining its accessible name", () => {
    render(
      <ManualTable
        block={createTableBlock("TABLA 12. Descripción completa de la tabla")}
        assets={[]}
      />,
    )

    const table = screen.getByRole("table", {
      name: "TABLA 12. Descripción completa de la tabla",
    })

    expect(within(table).getByText("TABLA 12.", { exact: true })).toBeInTheDocument()
    expect(
      within(table).getByText("Descripción completa de la tabla", { exact: true }),
    ).toBeInTheDocument()
  })

  it("normalizes a missing prefix period without changing the full accessible caption", () => {
    render(
      <ManualTable
        block={createTableBlock("TABLA 4 Comunidades autónomas y capitales")}
        assets={[]}
      />,
    )

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
    render(<ManualTable block={createTableBlock(caption)} assets={[]} />)

    const table = screen.getByRole("table", { name: caption })

    expect(within(table).getByText(caption, { exact: true })).toBeInTheDocument()
  })

  it("renders a row figure and its full caption inside the associated cell", () => {
    const block = {
      type: "table",
      headers: ["Fiesta", "Descripción", "Imagen"],
      rows: [
        [
          { text: "Fallas de Valencia" },
          { text: "Se celebran en marzo." },
          {
            text: "Símbolos: ninots.",
            figures: [
              {
                type: "figure",
                assetId: "figure-60-55",
                caption: "FIGURA 55. Mascletá en Valencia. © MrCarlos11",
              },
            ],
          },
        ],
      ],
    } as TableBlock

    render(<ManualTable block={block} assets={assets} />)

    const row = screen.getByRole("row", { name: /Fallas de Valencia/ })
    const image = within(row).getByRole("img", { name: "Mascletá en Valencia" })

    expect(image).toBeInTheDocument()
    expect(image.closest("td")).toHaveAttribute("data-label", "Imagen")
    expect(within(row).getByText("FIGURA 55.", { exact: true })).toBeInTheDocument()
    expect(within(row).getByText("Mascletá en Valencia.", { exact: true })).toBeInTheDocument()
    expect(within(row).getByText("© MrCarlos11", { exact: true })).toBeInTheDocument()
    expect(within(row).getByText("Símbolos: ninots.", { exact: true })).toBeInTheDocument()
  })
})

/** Create the smallest valid table block needed by caption rendering tests. */
function createTableBlock(caption: string): TableBlock {
  return {
    type: "table",
    caption,
    headers: ["Columna"],
    rows: [[{ text: "Valor" }]],
  }
}

/** Figure assets used by structured table-cell rendering tests. */
const assets: ManualAsset[] = [
  {
    id: "figure-60-55",
    src: "/manual/figures/figure-60-55.jpg",
    alt: "Mascletá en Valencia",
  },
]
