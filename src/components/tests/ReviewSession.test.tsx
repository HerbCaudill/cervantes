import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ReviewSession } from "@/components/ReviewSession"
import type { Question } from "@/types"

describe("ReviewSession", () => {
  it("advances progress when a card leaves the review queue", () => {
    render(<ReviewSession initialQuestions={QUESTIONS} onReview={vi.fn()} onComplete={vi.fn()} />)

    answerCorrectly("Primera pregunta")
    fireEvent.click(screen.getByRole("button", { name: "Bien" }))

    expect(screen.getByRole("progressbar", { name: "Progreso del repaso" })).toHaveAttribute(
      "aria-valuenow",
      "1",
    )
  })

  it("does not advance progress when an again card is requeued", () => {
    render(<ReviewSession initialQuestions={QUESTIONS} onReview={vi.fn()} onComplete={vi.fn()} />)

    fireEvent.click(screen.getByRole("button", { name: "Incorrecta" }))
    fireEvent.click(screen.getByRole("button", { name: "Otra vez" }))

    const progress = screen.getByRole("progressbar", { name: "Progreso del repaso" })
    expect(progress).toHaveAttribute("aria-valuenow", "0")
    expect(progress).toHaveAttribute("aria-valuemax", "2")
  })
})

/** Answer the named question with its correct option. */
function answerCorrectly(prompt: string) {
  expect(screen.getByText(prompt)).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "Correcta" }))
}

/** Two representative questions for exercising queue progress. */
const QUESTIONS: Question[] = [
  {
    id: "q1",
    section: "1",
    type: "multiple-choice",
    prompt: "Primera pregunta",
    options: ["Correcta", "Incorrecta"],
    answerIndex: 0,
  },
  {
    id: "q2",
    section: "1",
    type: "multiple-choice",
    prompt: "Segunda pregunta",
    options: ["Correcta", "Incorrecta"],
    answerIndex: 0,
  },
]
