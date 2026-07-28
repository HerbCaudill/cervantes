import { useState } from "react"
import { GradeControls } from "@/components/GradeControls"
import { QuestionCard } from "@/components/QuestionCard"
import { QueueStrip, type QueueResult } from "@/components/QueueStrip"
import { ReviewStateRow } from "@/components/ReviewStateRow"
import { createInitialState } from "@/lib/createInitialState"
import type { Grade, Question, StateMap } from "@/types"

/**
 * Drives a study session over a fixed list of due questions. Holds its own queue
 * so a lapsed question (answered wrong, graded "again") goes back to the end to be
 * seen again this session, while a correct answer removes it. Returns to the
 * resting practice screen when the queue empties.
 */
export function ReviewSession({ initialQuestions, states, onReview, onComplete }: Props) {
  const [queue, setQueue] = useState<Question[]>(initialQuestions)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [results, setResults] = useState<QueueResult[]>([])

  const current = queue[0]

  /** Record the grade, advance the queue, and reset for the next question. */
  const handleGrade = (grade: Grade) => {
    if (!current) return
    onReview(current.id, grade)
    const result = grade === "again" ? "fail" : "pass"
    setResults(previous => [...previous, result])
    setSelectedIndex(null)
    if (grade !== "again" && queue.length === 1) {
      onComplete()
      return
    }
    setQueue(([, ...rest]) => (grade === "again" ? [...rest, current] : rest))
  }

  if (!current) return null

  const state = states[current.id] ?? createInitialState(current.id)
  const answered = selectedIndex !== null
  const correct = answered && selectedIndex === current.answerIndex

  return (
    <div className="flex w-full flex-1 flex-col pt-[0.85rem]">
      <QueueStrip results={results} queueLength={queue.length} />
      <QuestionCard question={current} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
      <div className="mt-[0.85rem] px-[0.9rem]">
        <ReviewStateRow state={state} />
      </div>
      {answered ?
        <div className="mt-auto pt-[0.85rem]">
          <GradeControls correct={correct} state={state} onGrade={handleGrade} />
        </div>
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
  /** Return to the resting screen when the queue empties */
  onComplete: () => void
}
