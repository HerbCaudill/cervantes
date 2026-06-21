import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FlashCard } from "@/components/FlashCard"
import { GradeButtons } from "@/components/GradeButtons"
import { SessionComplete } from "@/components/SessionComplete"
import { createInitialState } from "@/lib/createInitialState"
import type { Card, Grade, StateMap } from "@/types"

/**
 * Drives a study session over a fixed list of due cards. Holds its own queue so
 * grading a card as "Again" puts it back at the end to be seen again this
 * session, while any other grade removes it. Shows `SessionComplete` when the
 * queue empties.
 */
export function ReviewSession({ initialCards, states, onReview }: Props) {
  const [queue, setQueue] = useState<Card[]>(initialCards)
  const [revealed, setRevealed] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)

  const current = queue[0]

  /** Record the grade, advance the queue, and reset for the next card. */
  const handleGrade = (grade: Grade) => {
    if (!current) return
    onReview(current.id, grade)
    setReviewedCount(n => n + 1)
    setRevealed(false)
    setQueue(([, ...rest]) => (grade === "again" ? [...rest, current] : rest))
  }

  if (!current) return <SessionComplete reviewedCount={reviewedCount} />

  const state = states[current.id] ?? createInitialState(current.id)

  return (
    <div className="flex w-full flex-col gap-4">
      <FlashCard card={current} revealed={revealed} onReveal={() => setRevealed(true)} />
      {revealed ?
        <GradeButtons state={state} onGrade={handleGrade} />
      : <Button onClick={() => setRevealed(true)}>Show answer</Button>}
    </div>
  )
}

interface Props {
  /** The cards to review this session, captured once when the session starts */
  initialCards: Card[]
  /** Live scheduling states, used to preview intervals on the grade buttons */
  states: StateMap
  /** Called to record a grade for a card */
  onReview: (cardId: string, grade: Grade) => void
}
