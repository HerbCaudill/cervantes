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

  it("uses the conventional mobile layout for a two-column table", () => {
    const block = {
      type: "table",
      caption: "TABLA 8. Sistema educativo español",
      headers: ["Nivel educativo", "Descripción"],
      rows: [[{ text: "Educación Infantil" }, { text: "No es obligatoria." }]],
    } as TableBlock

    render(<ManualTable block={block} assets={[]} />)

    expect(screen.getByRole("table")).toHaveAttribute("data-mobile-layout", "table")
  })

  it("uses the conventional mobile layout for Tables 9 and 10", () => {
    for (const tableNumber of ["9", "10"]) {
      const caption = `TABLA ${tableNumber}. Unidades de medida`
      const block = {
        type: "table",
        caption,
        headers: ["Magnitud", "Unidad", "Símbolo"],
        rows: [[{ text: "Longitud" }, { text: "metro" }, { text: "m" }]],
      } as TableBlock

      render(<ManualTable block={block} assets={[]} />)

      expect(screen.getByRole("table", { name: caption })).toHaveAttribute(
        "data-mobile-layout",
        "table",
      )
    }
  })

  it("right-aligns numeric columns without misclassifying prose or figures", () => {
    const block = {
      type: "table",
      headers: ["Lugar", "Población", "Período", "Medida", "Descripción", "Figura"],
      rows: [
        [
          { text: "Andalucía" },
          { text: "8 631 862" },
          { text: "1979-1981" },
          { text: "1 min = 60 s" },
          { text: "12 uvas en Nochevieja" },
          {
            text: null,
            figures: [
              {
                type: "figure",
                assetId: "figure-60-55",
                caption: "FIGURA 55. Mascletá en Valencia. © MrCarlos11",
              },
            ],
          },
        ],
        [
          { text: "Madrid" },
          { text: null },
          { text: "Siglos XVI-XVII" },
          { text: "3,5 km" },
          { text: "2024 fue un año bisiesto" },
          { text: "2024" },
        ],
      ],
    } as TableBlock

    render(<ManualTable block={block} assets={assets} />)

    for (const header of ["Población", "Período", "Medida"]) {
      expect(screen.getByRole("columnheader", { name: header })).toHaveAttribute(
        "data-alignment",
        "numeric",
      )
    }

    for (const header of ["Lugar", "Descripción", "Figura"]) {
      expect(screen.getByRole("columnheader", { name: header })).not.toHaveAttribute(
        "data-alignment",
      )
    }

    for (const value of ["8 631 862", "1979-1981", "Siglos XVI-XVII", "1 min = 60 s", "3,5 km"]) {
      expect(screen.getByText(value).closest("td")).toHaveAttribute("data-alignment", "numeric")
    }

    for (const value of ["12 uvas en Nochevieja", "2024 fue un año bisiesto", "2024"]) {
      expect(screen.getByText(value).closest("td")).not.toHaveAttribute("data-alignment")
    }
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
