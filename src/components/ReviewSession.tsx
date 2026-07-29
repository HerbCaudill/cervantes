import { useState } from "react"
import { GradeControls } from "@/components/GradeControls"
import { QuestionCard } from "@/components/QuestionCard"
import { QueueStrip } from "@/components/QueueStrip"
import type { Grade, Question } from "@/types"

/**
 * Drives a study session over a fixed list of due questions. Holds its own queue
 * so a lapsed question (answered wrong, graded "again") goes back to the end to be
 * seen again this session, while a correct answer removes it. Returns to the
 * resting practice screen when the queue empties.
 */
export function ReviewSession({ initialQuestions, onReview, onComplete }: Props) {
  const [queue, setQueue] = useState<Question[]>(initialQuestions)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const current = queue[0]

  /** Record the grade, advance the queue, and reset for the next question. */
  const handleGrade = (grade: Grade) => {
    if (!current) return
    onReview(current.id, grade)
    setSelectedIndex(null)
    if (grade !== "again" && queue.length === 1) {
      onComplete()
      return
    }
    setQueue(([, ...rest]) => (grade === "again" ? [...rest, current] : rest))
  }

  if (!current) return null

  const answered = selectedIndex !== null
  const correct = answered && selectedIndex === current.answerIndex

  return (
    <div className="flex w-full flex-1 flex-col pt-[0.85rem]">
      <QueueStrip
        completedCount={initialQuestions.length - queue.length}
        totalCount={initialQuestions.length}
      />
      <QuestionCard question={current} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
      {answered ?
        <div className="mt-auto pt-[0.85rem]">
          <GradeControls correct={correct} onGrade={handleGrade} />
        </div>
      : null}
    </div>
  )
}

interface Props {
  /** The questions to review this session, captured once when the session starts */
  initialQuestions: Question[]
  /** Called to record a grade for a question */
  onReview: (questionId: string, grade: Grade) => void
  /** Return to the resting screen when the queue empties */
  onComplete: () => void
}
