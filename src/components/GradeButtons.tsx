import { Button } from "@/components/ui/button"
import { formatInterval } from "@/lib/formatInterval"
import { scheduleCard } from "@/lib/scheduleCard"
import type { CardState, Grade } from "@/types"

/**
 * The four SM-2 grade buttons shown after an answer is revealed. Each button
 * previews the interval the card would get if that grade were chosen, computed
 * with the same `scheduleCard` function used to actually reschedule.
 */
export function GradeButtons({ state, onGrade }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {GRADES.map(({ grade, label }) => {
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

/** The grades in the order they're shown, hardest recall first. */
const GRADES: { grade: Grade; label: string }[] = [
  { grade: "again", label: "Again" },
  { grade: "hard", label: "Hard" },
  { grade: "good", label: "Good" },
  { grade: "easy", label: "Easy" },
]

interface Props {
  /** Current scheduling state of the card being graded, used for the previews */
  state: CardState
  /** Called with the chosen grade */
  onGrade: (grade: Grade) => void
}
