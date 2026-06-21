import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, it, expect } from "vitest"
import { App } from "@/App"

describe("App", () => {
  beforeEach(() => localStorage.clear())

  it("shows the deck header", () => {
    render(<App />)
    expect(screen.getByRole("heading", { name: /DELE flash cards/i })).toBeInTheDocument()
  })

  it("starts a session with cards due and reveals the answer on demand", () => {
    render(<App />)

    // a fresh deck has every card due, so a card and a reveal control are shown
    const showAnswer = screen.getByRole("button", { name: /show answer/i })
    expect(showAnswer).toBeInTheDocument()

    // revealing swaps the prompt for the four SM-2 grade buttons
    fireEvent.click(showAnswer)
    expect(screen.getByRole("button", { name: /again/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /good/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /easy/i })).toBeInTheDocument()
  })
})
