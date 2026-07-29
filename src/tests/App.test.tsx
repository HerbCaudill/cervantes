import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { App } from "@/App"
import { questions } from "@/data/questions"
import { loadStates } from "@/lib/loadStates"

describe("App", () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState(null, "", "/")
  })

  it("shows navigation without the title and question-count masthead", () => {
    render(<App />)
    expect(screen.queryByText(/boletín ccse/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/300 banco/i)).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Práctica" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Manual" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /empezar repaso/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Sección" })).toBeInTheDocument()
  })

  it("starts a stable session from the resting screen", () => {
    render(<App />)
    fireEvent.click(screen.getByRole("button", { name: /empezar repaso/i }))

    const first = questions[0]
    expect(screen.getByText(first.prompt)).toBeInTheDocument()
    for (const option of first.options) {
      expect(screen.getByRole("button", { name: option })).toBeInTheDocument()
    }
  })

  it("reveals grade controls after a correct answer", () => {
    render(<App />)
    fireEvent.click(screen.getByRole("button", { name: /empezar repaso/i }))
    const first = questions[0]
    const correctOption = first.options[first.answerIndex]

    fireEvent.click(screen.getByRole("button", { name: correctOption }))

    // a correct answer offers the SM-2 confidence grades
    expect(screen.getByRole("button", { name: /bien/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /fácil/i })).toBeInTheDocument()
  })

  it("offers Otra vez after a wrong answer", () => {
    render(<App />)
    fireEvent.click(screen.getByRole("button", { name: /empezar repaso/i }))
    const first = questions[0]
    const wrongIndex = first.answerIndex === 0 ? 1 : 0
    const wrongOption = first.options[wrongIndex]

    fireEvent.click(screen.getByRole("button", { name: wrongOption }))

    expect(screen.getByRole("button", { name: /otra vez/i })).toBeInTheDocument()
  })

  it("advances to the next question after grading", () => {
    render(<App />)
    fireEvent.click(screen.getByRole("button", { name: /empezar repaso/i }))
    const first = questions[0]
    const correctOption = first.options[first.answerIndex]

    fireEvent.click(screen.getByRole("button", { name: correctOption }))
    fireEvent.click(screen.getByRole("button", { name: /bien/i }))

    // the next question's prompt should now be shown (a fresh deck has several due)
    expect(screen.queryByText(first.prompt)).not.toBeInTheDocument()
    expect(screen.getByText(questions[1].prompt)).toBeInTheDocument()
  })

  it("does not let the user change a locked answer", () => {
    render(<App />)
    fireEvent.click(screen.getByRole("button", { name: /empezar repaso/i }))
    const first = questions[0]
    const wrongIndex = first.answerIndex === 0 ? 1 : 0

    fireEvent.click(screen.getByRole("button", { name: first.options[wrongIndex] }))
    const correctButton = screen.getByRole("button", { name: first.options[first.answerIndex] })
    expect(correctButton).toBeDisabled()
  })

  it("keeps only the primary destinations and search in the navigation during a review", () => {
    render(<App />)
    fireEvent.click(screen.getByRole("button", { name: /empezar repaso/i }))

    const navigation = screen.getByRole("navigation", { name: "Principal" })
    expect(within(navigation).getByRole("link", { name: "Práctica" })).toBeInTheDocument()
    expect(within(navigation).getByRole("link", { name: "Manual" })).toBeInTheDocument()
    expect(
      within(navigation).getByRole("link", { name: "Buscar en el manual" }),
    ).toBeInTheDocument()
    expect(within(navigation).queryByRole("button", { name: "Salir" })).not.toBeInTheDocument()
  })

  it("opens the manual from the top-level navigation", () => {
    render(<App />)

    fireEvent.click(screen.getByRole("link", { name: "Manual" }))

    expect(window.location.pathname).toBe("/manual")
    expect(screen.getByRole("heading", { name: "Manual CCSE" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /Índice de la Tarea \d/ })).not.toBeInTheDocument()
  })

  it("opens manual search from an icon in the primary navigation", () => {
    render(<App />)
    const primaryNavigation = screen.getByRole("navigation", { name: "Principal" })

    const searchLink = within(primaryNavigation).getByRole("link", {
      name: "Buscar en el manual",
    })
    expect(searchLink).not.toHaveTextContent("Buscar en el manual")

    fireEvent.click(searchLink)

    expect(window.location.pathname).toBe("/manual/buscar")
    expect(screen.getByRole("searchbox", { name: "Buscar en el manual" })).toBeInTheDocument()
  })

  it("supports direct links to anchored manual topics and search", () => {
    window.history.replaceState(
      null,
      "",
      "/manual/task-1#poderes-del-estado-gobierno-e-instituciones-01",
    )
    const { unmount } = render(<App />)

    expect(screen.getByRole("heading", { name: /Poderes del Estado/i })).toBeInTheDocument()

    unmount()
    window.history.replaceState(null, "", "/manual/buscar")
    render(<App />)
    expect(screen.getByRole("searchbox", { name: "Buscar en el manual" })).toBeInTheDocument()
  })

  it("leaves not-found index navigation to the primary Manual tab", () => {
    window.history.replaceState(null, "", "/manual/unknown")
    render(<App />)

    expect(screen.getByRole("heading", { name: "Página no encontrada" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Ir al índice del manual" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /^Manual$/ })).toHaveAttribute("href", "/manual")
  })

  it("renders a complete tarea at its manual route", () => {
    window.history.replaceState(null, "", "/manual/task-1")
    render(<App />)

    expect(
      screen.getByRole("heading", { name: "Gobierno, legislación y participación ciudadana" }),
    ).toBeInTheDocument()
    expect(document.querySelectorAll("[data-reader-topic]")).toHaveLength(15)
  })

  it("restores manual and practice screens with browser history", async () => {
    render(<App />)

    fireEvent.click(screen.getByRole("link", { name: "Manual" }))
    fireEvent.click(screen.getByRole("link", { name: "Práctica" }))
    expect(screen.getByRole("button", { name: /empezar repaso/i })).toBeInTheDocument()

    await act(() => {
      window.history.back()
      return new Promise(resolve => window.setTimeout(resolve, 0))
    })

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Manual CCSE" })).toBeInTheDocument(),
    )

    await act(() => {
      window.history.forward()
      return new Promise(resolve => window.setTimeout(resolve, 0))
    })

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /empezar repaso/i })).toBeInTheDocument(),
    )
  })

  it("preserves the live review queue while visiting the manual", () => {
    render(<App />)
    fireEvent.click(screen.getByRole("button", { name: /empezar repaso/i }))

    const first = questions[0]
    fireEvent.click(screen.getByRole("button", { name: first.options[first.answerIndex] }))
    fireEvent.click(screen.getByRole("button", { name: /bien/i }))

    expect(screen.getByText(questions[1].prompt)).toBeInTheDocument()
    expect(screen.getByRole("progressbar", { name: "Progreso del repaso" })).toHaveAttribute(
      "aria-valuenow",
      "1",
    )
    expect(loadStates()[first.id]?.repetitions).toBe(1)

    fireEvent.click(screen.getByRole("link", { name: "Manual" }))
    fireEvent.click(screen.getByRole("link", { name: "Práctica" }))

    expect(screen.queryByText(first.prompt)).not.toBeInTheDocument()
    expect(screen.getByText(questions[1].prompt)).toBeInTheDocument()
    expect(screen.getByRole("progressbar", { name: "Progreso del repaso" })).toHaveAttribute(
      "aria-valuenow",
      "1",
    )
    expect(loadStates()[first.id]?.repetitions).toBe(1)
  })
})
