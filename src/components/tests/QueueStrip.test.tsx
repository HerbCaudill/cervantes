import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { QueueStrip } from "@/components/QueueStrip"

describe("QueueStrip", () => {
  it("exposes the completed-card progress with an accessible name and values", () => {
    render(<QueueStrip completedCount={2} totalCount={5} />)

    const progress = screen.getByRole("progressbar", { name: "Progreso del repaso" })
    expect(progress).toHaveAttribute("aria-valuemin", "0")
    expect(progress).toHaveAttribute("aria-valuemax", "5")
    expect(progress).toHaveAttribute("aria-valuenow", "2")
    expect(progress).toHaveAttribute("aria-valuetext", "2 de 5 tarjetas completadas")
  })

  it("renders one continuous progress indicator instead of a result list", () => {
    render(<QueueStrip completedCount={2} totalCount={5} />)

    expect(screen.getAllByRole("progressbar")).toHaveLength(1)
    expect(screen.queryByRole("list")).not.toBeInTheDocument()
  })

  it("reports 100 percent only when every initial card is complete", () => {
    const { rerender } = render(<QueueStrip completedCount={4} totalCount={5} />)

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "4")

    rerender(<QueueStrip completedCount={5} totalCount={5} />)

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "5")
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuetext",
      "5 de 5 tarjetas completadas",
    )
  })
})
