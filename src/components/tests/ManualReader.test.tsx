import { render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { App } from "@/App"
import manualDraft from "@/manual/manual.draft.json"

describe("manual reader", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/manual")
  })

  it("makes every extracted topic reachable from the manual index", () => {
    render(<App />)

    const expectedTopics = manualDraft.sections.reduce(
      (count, section) => count + section.topics.length,
      0,
    )
    const index = screen.getByRole("navigation", { name: "Índice completo del manual" })

    expect(within(index).getAllByRole("link")).toHaveLength(expectedTopics + 5)
    expect(expectedTopics).toBe(65)
  })

  it("renders real paragraphs, lists, tables, figures, captions, and callouts semantically", () => {
    window.history.replaceState(null, "", "/manual/task-5/task-5-draft-page-78")
    render(<App />)
    const article = screen.getByRole("article")

    expect(
      within(article).getByText(
        "En España hay tres tipos de centros educativos según su financiación:",
      ),
    ).toBeInTheDocument()
    expect(within(article).getByRole("list")).toBeInTheDocument()

    const table = within(article).getByRole("table")
    expect(within(table).getByRole("columnheader", { name: "Nivel educativo" })).toBeInTheDocument()
    expect(within(table).getByText("Enseñanza universitaria")).toBeInTheDocument()

    const figure = screen.getByRole("figure")
    expect(
      within(figure).getByRole("img", {
        name: /Estatua de Fray Luis de León frente a un patio/i,
      }),
    ).toHaveAttribute("src", "/manual/figures/figure-78-76.jpg")
    expect(within(figure).getByText(/^FIGURA 76\./)).toBeInTheDocument()
    expect(screen.getByRole("complementary")).toHaveTextContent(
      "Para acceder a la Universidad se requiere el título de Bachillerato",
    )
  })

  it("labels every table cell for the stacked mobile presentation", () => {
    window.history.replaceState(null, "", "/manual/task-5/task-5-draft-page-78")
    render(<App />)

    const firstRow = within(screen.getByRole("article")).getAllByRole("row")[1]
    const cells = within(firstRow).getAllByRole("cell")

    expect(cells[0]).toHaveAttribute("data-label", "Nivel educativo")
    expect(cells[1]).toHaveAttribute("data-label", "Descripción")
  })

  it("shows running context, cross-task navigation, and one official-source attribution", () => {
    window.history.replaceState(null, "", "/manual/task-1/task-1-draft-page-17")
    render(<App />)

    expect(screen.getByText("T1 · 12")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Siguiente.*DESTACADOS DERECHOS/i })).toHaveAttribute(
      "href",
      "/manual/task-2/task-2-draft-page-28",
    )

    const sourceLinks = screen.getAllByRole("link", { name: /fuente oficial/i })
    expect(sourceLinks).toHaveLength(1)
    expect(sourceLinks[0]).toHaveAttribute("href", manualDraft.sourceUrl)
    expect(document.body).not.toHaveTextContent(/Página PDF/i)
  })

  it("keeps article numbers in a dedicated marginal column", () => {
    window.history.replaceState(null, "", "/manual/task-2/task-2-draft-page-29")
    render(<App />)

    const note = within(screen.getByRole("article")).getByText("Artículo 15", {
      selector: "[data-margin-note]",
    })
    expect(note).toHaveAttribute("aria-hidden", "true")
  })

  it("keeps key dates in a dedicated marginal column", () => {
    window.history.replaceState(null, "", "/manual/task-1/task-1-draft-page-6")
    render(<App />)

    const note = within(screen.getByRole("article")).getByText("1978", {
      selector: "[data-margin-note]",
    })
    expect(note).toHaveAttribute("aria-hidden", "true")
  })
})
