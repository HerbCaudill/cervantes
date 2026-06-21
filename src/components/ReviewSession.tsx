import { useState } from "react"
import { GradeControls } from "@/components/GradeControls"
import { QuestionCard } from "@/components/QuestionCard"
import { SessionComplete } from "@/components/SessionComplete"
import { createInitialState } from "@/lib/createInitialState"
import type { Grade, Question, StateMap } from "@/types"

/**
 * Drives a study session over a fixed list of due questions. Holds its own queue
 * so a lapsed question (answered wrong, graded "again") goes back to the end to be
 * seen again this session, while a correct answer removes it. Shows
 * `SessionComplete` when the queue empties.
 */
export function ReviewSession({ initialQuestions, states, onReview }: Props) {
  const [queue, setQueue] = useState<Question[]>(initialQuestions)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [reviewedCount, setReviewedCount] = useState(0)

  const current = queue[0]

  /** Record the grade, advance the queue, and reset for the next question. */
  const handleGrade = (grade: Grade) => {
    if (!current) return
    onReview(current.id, grade)
    setReviewedCount(n => n + 1)
    setSelectedIndex(null)
    setQueue(([, ...rest]) => (grade === "again" ? [...rest, current] : rest))
  }

  if (!current) return <SessionComplete reviewedCount={reviewedCount} />

  const state = states[current.id] ?? createInitialState(current.id)
  const answered = selectedIndex !== null
  const correct = answered && selectedIndex === current.answerIndex

  return (
    <div className="flex w-full flex-col gap-4">
      <QuestionCard question={current} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
      {answered ?
        <GradeControls correct={correct} state={state} onGrade={handleGrade} />
      : null}
    </div>
  )
}

interface Props {
  /** The questions to review this session, captured once when the session starts */
  initialQuestions: Question[]
  /** Live scheduling states, used to preview intervals on the grade buttons */
  states: StateMap
  /** Called to record a grade for a question */
  onReview: (questionId: string, grade: Grade) => void
}
