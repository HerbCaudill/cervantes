import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PracticeHome } from "@/components/PracticeHome"

describe("PracticeHome", () => {
  it("presents the review action and remaining-card totals without reading progress", () => {
    renderPracticeHome({ dueCount: 3 })

    const tableHead = screen.getAllByRole("rowgroup")[0]
    expect(screen.getByRole("button", { name: "Empezar repaso" })).toBeEnabled()
    expect(within(tableHead).getByRole("columnheader", { name: "Pendiente" })).toBeInTheDocument()
    expect(within(tableHead).getByRole("columnheader", { name: "Total" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Seguir leyendo" })).not.toBeInTheDocument()
  })

  it("marks practice statistics as numeric while leaving section labels textual", () => {
    renderPracticeHome({ dueCount: 3 })

    const tableHead = screen.getAllByRole("rowgroup")[0]
    expect(within(tableHead).getByRole("columnheader", { name: "Sección" })).not.toHaveAttribute(
      "data-alignment",
    )

    for (const header of ["Pendiente", "Total"]) {
      expect(within(tableHead).getByRole("columnheader", { name: header })).toHaveAttribute(
        "data-alignment",
        "numeric",
      )
    }

    const sectionRow = screen.getByRole("row", { name: "1 3 12" })
    expect(within(sectionRow).getByRole("columnheader")).not.toHaveAttribute("data-alignment")
    for (const cell of within(sectionRow).getAllByRole("cell")) {
      expect(cell).toHaveAttribute("data-alignment", "numeric")
    }
  })

  it("starts a review from the primary action", () => {
    const onStart = vi.fn()
    renderPracticeHome({ onStart })

    fireEvent.click(screen.getByRole("button", { name: "Empezar repaso" }))

    expect(onStart).toHaveBeenCalledOnce()
  })

  it("keeps the review action disabled when no cards are pending", () => {
    renderPracticeHome({ dueCount: 0 })

    expect(screen.getByRole("button", { name: "No hay preguntas pendientes" })).toBeDisabled()
  })
})

/** Render the resting screen with representative practice and reading data. */
function renderPracticeHome({
  dueCount = 3,
  onStart = vi.fn(),
}: {
  /** Questions currently available to start */
  dueCount?: number
  /** Start a session from the current due queue */
  onStart?: () => void
}) {
  render(
    <PracticeHome
      stats={[{ section: "1", due: dueCount, bank: 12 }]}
      dueCount={dueCount}
      onStart={onStart}
    />,
  )
}
