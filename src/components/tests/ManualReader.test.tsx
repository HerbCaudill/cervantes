import { act, fireEvent, render, screen, within } from "@testing-library/react"
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
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    })
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
    const topicLinks = within(index)
      .getAllByRole("link")
      .filter(link => link.getAttribute("href")?.includes("#"))

    expect(topicLinks).toHaveLength(expectedTopics)
  })

  it("renders every tarea topic in source order with stable heading anchors", () => {
    const section = manual.sections[4]
    window.history.replaceState(null, "", `/manual/${section.id}`)
    render(<App />)

    const topicSections = Array.from(document.querySelectorAll<HTMLElement>("[data-reader-topic]"))

    expect(
      topicSections.map(topicSection => within(topicSection).getByRole("heading", { level: 2 }).id),
    ).toEqual(section.topics.map(topic => getManualTopicSlug(section, topic)))
    expect(topicSections.map(topicSection => topicSection.dataset.readerTopic)).toEqual(
      section.topics.map(topic => topic.id),
    )
  })

  it("renders real paragraphs, lists, tables, figures, and captions semantically", () => {
    window.history.replaceState(null, "", "/manual/task-5#educacion-06")
    render(<App />)
    const article = screen.getByRole("article")

    expect(
      within(article).getByText(
        "En España hay tres tipos de centros educativos según su financiación:",
      ),
    ).toBeInTheDocument()
    expect(within(article).getAllByRole("list").length).toBeGreaterThan(0)

    const table = within(article).getByRole("table", {
      name: "TABLA 8. Sistema educativo español",
    })
    expect(within(table).getByRole("columnheader", { name: "Nivel educativo" })).toBeInTheDocument()
    expect(within(table).getByText("Enseñanza universitaria")).toBeInTheDocument()

    const image = within(article).getByRole("img", {
      name: /Estatua de Fray Luis de León frente a un patio/i,
    })
    const figure = image.closest("figure")
    expect(figure).not.toBeNull()
    expect(image).toHaveAttribute("src", "/manual/figures/figure-78-76.jpg")
    expect(within(figure!).getByText(/^FIGURA 76\./)).toBeInTheDocument()
  })

  it("renders Table 8 as two labeled columns with its image after the description", () => {
    window.history.replaceState(null, "", "/manual/task-5#educacion-06")
    render(<App />)

    const table = within(screen.getByRole("article")).getByRole("table", {
      name: "TABLA 8. Sistema educativo español",
    })
    const firstRow = within(table).getAllByRole("row")[1]
    const cells = within(firstRow).getAllByRole("cell")
    const image = within(firstRow).getByRole("img", {
      name: /La educación infantil no es obligatoria/i,
    })

    expect(cells).toHaveLength(2)
    expect(cells[0]).toHaveAttribute("data-label", "Nivel educativo")
    expect(cells[1]).toHaveAttribute("data-label", "Descripción")
    expect(image.closest("td")).toBe(cells[1])
  })

  it("renders each population entry as a complete labeled two-cell row", () => {
    window.history.replaceState(null, "", "/manual/task-1#poblacion-14")
    render(<App />)

    const table = within(screen.getByRole("article")).getByRole("table", {
      name: "TABLA 2. Número de habitantes por comunidades autónomas",
    })
    const rows = within(table).getAllByRole("row")

    expect(rows).toHaveLength(20)
    for (const row of rows.slice(1)) {
      const cells = within(row).getAllByRole("cell")
      expect(cells).toHaveLength(2)
      expect(cells[0]).toHaveAttribute("data-label", "Comunidades y ciudades autónomas")
      expect(cells[1]).toHaveAttribute("data-label", "Población")
      expect(cells[0]).not.toBeEmptyDOMElement()
      expect(cells[1]).not.toBeEmptyDOMElement()
    }
  })

  it("renders the one-year nationality cases as a nested unmarked list", () => {
    window.history.replaceState(
      null,
      "",
      "/manual/task-5#identificacion-personal-y-tramites-administrativos-01",
    )
    render(<App />)

    const article = screen.getByRole("article")
    const parentItem = within(article).getByText("1 año: en casos especiales, por ejemplo:", {
      exact: false,
      selector: "li",
    })
    const parentList = parentItem.closest("ul")
    const childList = within(parentItem).queryByRole("list")

    expect(parentList).not.toBeNull()
    expect(parentList!.querySelectorAll(":scope > li")).toHaveLength(1)
    expect(childList).not.toBeNull()
    expect(
      within(childList!)
        .getAllByRole("listitem")
        .map(item => item.textContent),
    ).toEqual([
      "a. Nacido en España.",
      "b. Casado con un ciudadano español.",
      "c. Viudo de un ciudadano español (si no había separación).",
      "d. Haber residido bajo tutela o acogimiento de un ciudadano español.",
    ])
  })

  it("renders the normalized population headers without React key warnings", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined)
    window.history.replaceState(null, "", "/manual/task-1#poblacion-14")
    render(<App />)

    const table = within(screen.getByRole("article")).getByRole("table", {
      name: "TABLA 2. Número de habitantes por comunidades autónomas",
    })

    expect(
      within(table)
        .getAllByRole("columnheader")
        .map(header => header.textContent),
    ).toEqual(["Comunidades y ciudades autónomas", "Población"])
    expect(error.mock.calls.flat().join(" ")).not.toContain(
      "Encountered two children with the same key",
    )
  })

  it("renders the Felipe VI prose once while retaining its figure", () => {
    window.history.replaceState(
      null,
      "",
      "/manual/task-1#poderes-del-estado-gobierno-e-instituciones-01",
    )
    render(<App />)

    const article = screen.getByRole("article")
    const repeatedText =
      "El rey de España es el jefe del Estado, tiene la máxima representación. Su papel consiste en actuar como mediador y garantizar el buen funcionamiento de las instituciones."

    expect(within(article).getAllByText(repeatedText, { exact: false })).toHaveLength(1)
    expect(
      within(article).getByRole("img", {
        name: "Su Majestad el rey Felipe VI",
      }),
    ).toHaveAttribute("src", "/manual/figures/figure-8-2.jpg")
  })

  it("shows tarea context without previous or next topic controls", () => {
    window.history.replaceState(null, "", "/manual/task-1#participacion-ciudadana-15")
    render(<App />)

    const tareaLabel = screen.getByText("Tarea 1")
    const title = screen.getByRole("heading", {
      level: 1,
      name: "Gobierno, legislación y participación ciudadana",
    })

    expect(tareaLabel).toBeInTheDocument()
    expect(tareaLabel.nextElementSibling).toBe(title)
    expect(
      screen.queryByRole("navigation", { name: "Temas anterior y siguiente" }),
    ).not.toBeInTheDocument()

    expect(screen.queryByRole("link", { name: /fuente oficial/i })).not.toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/Fuente oficial/i)
    expect(document.body).not.toHaveTextContent(/Página PDF/i)
  })

  it("links each tarea to its previous and next tareas", () => {
    window.history.replaceState(null, "", "/manual/task-3")
    const middleRender = render(<App />)

    const middleNavigation = screen.getByRole("navigation", {
      name: "Tareas anterior y siguiente",
    })
    expect(
      within(middleNavigation).getByRole("link", {
        name: "Tarea anterior: Tarea 2, Derechos y deberes fundamentales",
      }),
    ).toHaveAttribute("href", "/manual/task-2")
    expect(
      within(middleNavigation).getByRole("link", {
        name: "Tarea siguiente: Tarea 4, Cultura e historia de España",
      }),
    ).toHaveAttribute("href", "/manual/task-4")

    middleRender.unmount()
    window.history.replaceState(null, "", "/manual/task-1")
    const firstRender = render(<App />)

    const firstNavigation = screen.getByRole("navigation", {
      name: "Tareas anterior y siguiente",
    })
    expect(within(firstNavigation).queryByRole("link", { name: /Tarea anterior/ })).toBeNull()
    expect(within(firstNavigation).getByRole("link", { name: /Tarea siguiente/ })).toHaveAttribute(
      "href",
      "/manual/task-2",
    )

    firstRender.unmount()
    window.history.replaceState(null, "", "/manual/task-5")
    render(<App />)

    const lastNavigation = screen.getByRole("navigation", {
      name: "Tareas anterior y siguiente",
    })
    expect(within(lastNavigation).getByRole("link", { name: /Tarea anterior/ })).toHaveAttribute(
      "href",
      "/manual/task-4",
    )
    expect(within(lastNavigation).queryByRole("link", { name: /Tarea siguiente/ })).toBeNull()
  })

  it("leaves index navigation to the primary Manual tab", () => {
    window.history.replaceState(null, "", "/manual/task-1#participacion-ciudadana-15")
    render(<App />)

    expect(screen.queryByRole("link", { name: "← Índice del manual" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /^Manual$/ })).toHaveAttribute("href", "/manual")
    expect(screen.queryByRole("link", { name: "← Tarea 1" })).not.toBeInTheDocument()
  })

  it("does not repeat article numbers or dates in a marginal column", () => {
    window.history.replaceState(null, "", "/manual/task-2#articulo-15-06")
    render(<App />)

    expect(document.querySelector("[data-margin-note]")).not.toBeInTheDocument()
  })

  it("uses the source heading as the topic title without a redundant subheading", () => {
    window.history.replaceState(null, "", "/manual/task-2#articulo-22-11")
    render(<App />)

    const article = screen.getByRole("article")

    expect(within(article).getByRole("heading", { level: 2, name: "Artículo 22" })).toBeVisible()
    expect(within(article).queryByRole("heading", { level: 3 })).not.toBeInTheDocument()
    expect(within(article).queryByRole("heading", { level: 4 })).not.toBeInTheDocument()
  })

  it("shows automatically derived task progress without a resume action", () => {
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
    window.history.replaceState(null, "", "/manual")
    render(<App />)

    expect(screen.queryByRole("link", { name: /Seguir leyendo/i })).not.toBeInTheDocument()
    expect(screen.getByText("10 %")).toBeInTheDocument()
  })

  it("persists the current offset and furthest progress on pagehide", async () => {
    const topic = manual.sections[0].topics[0]
    window.history.replaceState(
      null,
      "",
      `/manual/task-1#${getManualTopicSlug(manual.sections[0], topic)}`,
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
