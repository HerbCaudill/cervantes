import type { Grade } from "@/types"

/**
 * The controls shown after a question is answered. A wrong answer offers a single
 * "Otra vez" action that lapses the card ("again", so it returns soon and reappears
 * later this session). A correct answer offers the three positive grade actions.
 */
export function GradeControls({ correct, onGrade }: Props) {
  if (!correct) {
    return (
      <div className="border-ink border-t">
        <button
          type="button"
          onClick={() => onGrade("again")}
          className="bg-ink text-paper min-h-14 w-full font-sans text-xs font-bold tracking-[0.1em] uppercase"
        >
          Otra vez
        </button>
      </div>
    )
  }

  return (
    <div className="border-ink grid grid-cols-3 border-t">
      {POSITIVE_GRADES.map(({ grade, label }) => (
        <button
          key={grade}
          type="button"
          onClick={() => onGrade(grade)}
          className={
            grade === "good" ?
              "bg-rule/45 border-rule-hard flex min-h-14 items-center justify-center border-r font-sans last:border-r-0"
            : "border-rule-hard flex min-h-14 items-center justify-center border-r font-sans last:border-r-0"
          }
        >
          <span className="text-xs font-bold tracking-[0.1em] uppercase">{label}</span>
        </button>
      ))}
    </div>
  )
}

/** Grades offered after a correct answer, in increasing ease. */
const POSITIVE_GRADES: { grade: Grade; label: string }[] = [
  { grade: "hard", label: "Difícil" },
  { grade: "good", label: "Bien" },
  { grade: "easy", label: "Fácil" },
]

interface Props {
  /** Whether the user answered correctly */
  correct: boolean
  /** Called with the chosen grade */
  onGrade: (grade: Grade) => void
}
