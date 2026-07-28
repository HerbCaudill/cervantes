import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { App } from "@/App"
import { questions } from "@/data/questions"

describe("App", () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState(null, "", "/")
  })

  it("shows the Spanish masthead and resting screen before a session", () => {
    render(<App />)
    expect(screen.getByRole("heading", { name: /boletín ccse/i })).toBeInTheDocument()
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

  it("opens the manual from the top-level navigation", () => {
    render(<App />)

    fireEvent.click(screen.getByRole("link", { name: "Manual" }))

    expect(window.location.pathname).toBe("/manual")
    expect(screen.getByRole("heading", { name: "Manual CCSE" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Buscar en el manual" })).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: /Tarea \d/ })).toHaveLength(5)
  })

  it("supports direct links to manual tasks, topics, and search", () => {
    window.history.replaceState(null, "", "/manual/task-1")
    const { unmount } = render(<App />)

    expect(
      screen.getByRole("heading", { name: "Gobierno, legislación y participación ciudadana" }),
    ).toBeInTheDocument()

    const topicLink = screen.getAllByRole("link", { name: /Poderes del Estado/i })[0]
    const topicPath = topicLink.getAttribute("href")
    expect(topicPath).toMatch(/^\/manual\/task-1\//)

    unmount()
    window.history.replaceState(null, "", topicPath)
    render(<App />)
    expect(screen.getByRole("heading", { name: /Poderes del Estado/i })).toBeInTheDocument()

    unmount()
    window.history.replaceState(null, "", "/manual/buscar")
    render(<App />)
    expect(screen.getByRole("searchbox", { name: "Buscar en el manual" })).toBeInTheDocument()
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
})
