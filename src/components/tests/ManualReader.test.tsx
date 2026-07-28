import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { App } from "@/App"
import manualDraft from "@/manual/manual.draft.json"
import { getManualTopicSlug } from "@/manual/getManualTopicSlug"
import type { Manual } from "@/manual/types"
import { READER_STATE_STORAGE_KEY, READER_STATE_VERSION } from "@/reader/constants"
import type { ReaderState } from "@/reader/types"

const manual = manualDraft as Manual

describe("manual reader", () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState(null, "", "/manual")
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("makes every extracted topic reachable from the manual index", () => {
    render(<App />)

    const expectedTopics = manualDraft.sections.reduce(
      (count, section) => count + section.topics.length,
      0,
    )
    const index = screen.getByRole("navigation", { name: "Índice completo del manual" })

    expect(within(index).getAllByRole("link")).toHaveLength(expectedTopics + 5)
  })

  it("renders real paragraphs, lists, tables, figures, captions, and callouts semantically", () => {
    window.history.replaceState(null, "", "/manual/task-5/sociedad-espanola-09")
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
    expect(screen.getByRole("note")).toHaveTextContent(
      "Para acceder a la Universidad se requiere el título de Bachillerato",
    )
  })

  it("labels every table cell for the stacked mobile presentation", () => {
    window.history.replaceState(null, "", "/manual/task-5/sociedad-espanola-09")
    render(<App />)

    const firstRow = within(screen.getByRole("article")).getAllByRole("row")[1]
    const cells = within(firstRow).getAllByRole("cell")

    expect(cells[0]).toHaveAttribute("data-label", "Nivel educativo")
    expect(cells[1]).toHaveAttribute("data-label", "Descripción")
  })

  it("renders repeated table headers without duplicate React keys", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined)
    window.history.replaceState(null, "", "/manual/task-1/poblacion-14")
    render(<App />)

    const table = within(screen.getByRole("article")).getByRole("table")

    expect(
      within(table).getAllByRole("columnheader", {
        name: "Comunidades y ciudades autónomas",
      }),
    ).toHaveLength(3)
    expect(error.mock.calls.flat().join(" ")).not.toContain(
      "Encountered two children with the same key",
    )
  })

  it("renders multiple untitled callouts as notes instead of unlabeled landmarks", () => {
    window.history.replaceState(
      null,
      "",
      "/manual/task-1/poderes-del-estado-gobierno-e-instituciones-01",
    )
    render(<App />)

    expect(within(screen.getByRole("article")).getAllByRole("note")).toHaveLength(3)
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument()
  })

  it("shows running context, cross-task navigation, and one official-source attribution", () => {
    window.history.replaceState(null, "", "/manual/task-1/participacion-ciudadana-15")
    render(<App />)

    expect(screen.getByText("T1 · 15")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Siguiente.*DESTACADOS DERECHOS/i })).toHaveAttribute(
      "href",
      "/manual/task-2/destacados-derechos-deberes-y-libertades-01",
    )

    const sourceLinks = screen.getAllByRole("link", { name: /fuente oficial/i })
    expect(sourceLinks).toHaveLength(1)
    expect(sourceLinks[0]).toHaveAttribute("href", manualDraft.sourceUrl)
    expect(document.body).not.toHaveTextContent(/Página PDF/i)
  })

  it("keeps article numbers in a dedicated marginal column", () => {
    window.history.replaceState(null, "", "/manual/task-2/articulo-15-06")
    render(<App />)

    const note = within(screen.getByRole("article")).getByText("Art.15", {
      selector: "[data-margin-note]",
    })
    expect(note).toHaveAttribute("aria-hidden", "true")
  })

  it("keeps key dates in a dedicated marginal column", () => {
    window.history.replaceState(
      null,
      "",
      "/manual/task-1/poderes-del-estado-gobierno-e-instituciones-01",
    )
    render(<App />)

    const note = within(screen.getByRole("article")).getByText("1978", {
      selector: "[data-margin-note]",
    })
    expect(note).toHaveAttribute("aria-hidden", "true")
  })

  it("renders in-prose article references from the integrated source in the margin", () => {
    window.history.replaceState(null, "", "/manual/task-1/participacion-ciudadana-15")
    render(<App />)

    const article = screen.getByRole("article")

    expect(within(article).getByText("Art.22", { selector: "[data-margin-note]" })).toHaveAttribute(
      "aria-hidden",
      "true",
    )
    expect(within(article).getByText("Art.6", { selector: "[data-margin-note]" })).toHaveAttribute(
      "aria-hidden",
      "true",
    )
  })

  it("uses the source heading as the topic title without a redundant subheading", () => {
    window.history.replaceState(null, "", "/manual/task-2/articulo-22-11")
    render(<App />)

    const article = screen.getByRole("article")

    expect(within(article).getByRole("heading", { level: 2, name: "Artículo 22" })).toBeVisible()
    expect(within(article).queryByRole("heading", { level: 3 })).not.toBeInTheDocument()
    expect(within(article).queryByRole("heading", { level: 4 })).not.toBeInTheDocument()
  })

  it("shows automatically derived task progress and a resume action on both resting screens", () => {
    const section = manual.sections[0]
    const topic = section.topics[1]
    const state: ReaderState = {
      version: READER_STATE_VERSION,
      lastTopicId: topic.id,
      topics: {
        [section.topics[0].id]: { scrollPosition: 0, maximumProgress: 1 },
        [topic.id]: { scrollPosition: 240, maximumProgress: 0.5 },
      },
    }
    localStorage.setItem(READER_STATE_STORAGE_KEY, JSON.stringify(state))
    window.history.replaceState(null, "", "/")

    const { unmount } = render(<App />)

    expect(screen.getByRole("link", { name: /Seguir leyendo/i })).toHaveAttribute(
      "href",
      `/manual/${section.id}/${getManualTopicSlug(section, topic)}`,
    )
    expect(screen.getByText("10 %")).toBeInTheDocument()

    unmount()
    window.history.replaceState(null, "", "/manual")
    render(<App />)

    expect(screen.getAllByRole("link", { name: /Seguir leyendo/i })).not.toHaveLength(0)
    expect(screen.getAllByText("10 %")).not.toHaveLength(0)
  })

  it("resumes the latest semantic topic at its saved position", async () => {
    const section = manual.sections[0]
    const topic = section.topics[1]
    const state: ReaderState = {
      version: READER_STATE_VERSION,
      lastTopicId: topic.id,
      topics: {
        [topic.id]: { scrollPosition: 320, maximumProgress: 0.5 },
      },
    }
    localStorage.setItem(READER_STATE_STORAGE_KEY, JSON.stringify(state))
    window.history.replaceState(null, "", "/")

    render(<App />)
    fireEvent.click(screen.getByRole("link", { name: /Seguir leyendo/i }))

    expect(window.location.pathname).toBe(
      `/manual/${section.id}/${getManualTopicSlug(section, topic)}`,
    )
    await waitFor(() =>
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 320,
        left: 0,
        behavior: "auto",
      }),
    )
  })

  it("persists the current offset and furthest progress on pagehide", async () => {
    const topic = manual.sections[0].topics[0]
    window.history.replaceState(
      null,
      "",
      `/manual/task-1/${getManualTopicSlug(manual.sections[0], topic)}`,
    )
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 1_200,
    })
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 600,
    })
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 600,
    })

    render(<App />)
    await act(async () => {
      fireEvent.scroll(window)
      await new Promise(resolve => window.requestAnimationFrame(resolve))
      window.dispatchEvent(new Event("pagehide"))
    })

    expect(JSON.parse(localStorage.getItem(READER_STATE_STORAGE_KEY) ?? "")).toMatchObject({
      lastTopicId: topic.id,
      topics: {
        [topic.id]: {
          scrollPosition: 600,
          maximumProgress: 1,
        },
      },
    })
  })
})
