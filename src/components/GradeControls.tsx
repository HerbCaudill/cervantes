import { Button } from "@/components/ui/button"
import { formatInterval } from "@/lib/formatInterval"
import { scheduleCard } from "@/lib/scheduleCard"
import type { Grade, ReviewState } from "@/types"

/**
 * The controls shown after a question is answered. A wrong answer offers a single
 * "Continue" action that lapses the card ("again", so it returns soon and reappears
 * later this session). A correct answer offers Hard/Good/Easy buttons that each
 * preview the resulting interval, computed with the same `scheduleCard` function
 * used to actually reschedule.
 */
export function GradeControls({ correct, state, onGrade }: Props) {
  if (!correct) {
    return (
      <Button onClick={() => onGrade("again")} className="w-full">
        Continue
      </Button>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {POSITIVE_GRADES.map(({ grade, label }) => {
        const preview = scheduleCard(state, grade)
        return (
          <Button
            key={grade}
            variant="outline"
            onClick={() => onGrade(grade)}
            className="flex h-auto flex-col gap-1 py-3"
          >
            <span className="font-medium">{label}</span>
            <span className="text-muted-foreground text-xs">
              {formatInterval(preview.interval)}
            </span>
          </Button>
        )
      })}
    </div>
  )
}

/** Grades offered after a correct answer, in increasing ease. */
const POSITIVE_GRADES: { grade: Grade; label: string }[] = [
  { grade: "hard", label: "Hard" },
  { grade: "good", label: "Good" },
  { grade: "easy", label: "Easy" },
]

interface Props {
  /** Whether the user answered correctly */
  correct: boolean
  /** Current scheduling state of the question, used for the interval previews */
  state: ReviewState
  /** Called with the chosen grade */
  onGrade: (grade: Grade) => void
}
