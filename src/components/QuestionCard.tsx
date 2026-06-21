import { IconCheck, IconX } from "@tabler/icons-react"
import { formatSection } from "@/lib/formatSection"
import { cn } from "@/lib/utils"
import type { Question } from "@/types"

/**
 * Shows a CCSE question and its answer options. Before answering, the options are
 * selectable buttons. Once `selectedIndex` is set, the correct option is marked,
 * a wrong choice is flagged, the options lock, and any explanation is shown.
 */
export function QuestionCard({ question, selectedIndex, onSelect }: Props) {
  const answered = selectedIndex !== null

  return (
    <div className="bg-card text-card-foreground flex flex-col gap-5 rounded-xl border p-6 shadow-sm">
      <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
        {formatSection(question.section)}
      </span>
      <p className="text-xl font-medium">{question.prompt}</p>

      <div
        className={cn("grid gap-2", question.type === "true-false" ? "grid-cols-2" : "grid-cols-1")}
      >
        {question.options.map((option, index) => {
          const isCorrect = index === question.answerIndex
          const isChosen = index === selectedIndex
          return (
            <button
              key={index}
              type="button"
              disabled={answered}
              onClick={() => onSelect(index)}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-left transition",
                !answered && "hover:border-primary hover:bg-accent",
                answered && isCorrect && "border-green-600 bg-green-50 text-green-900",
                answered && isChosen && !isCorrect && "border-red-600 bg-red-50 text-red-900",
                answered && !isCorrect && !isChosen && "opacity-60",
              )}
            >
              <span>{option}</span>
              {answered && isCorrect ?
                <IconCheck className="size-5 shrink-0" stroke={2} />
              : null}
              {answered && isChosen && !isCorrect ?
                <IconX className="size-5 shrink-0" stroke={2} />
              : null}
            </button>
          )
        })}
      </div>

      {answered && question.explanation ?
        <p className="text-muted-foreground border-border border-l-2 pl-3 text-sm">
          {question.explanation}
        </p>
      : null}
    </div>
  )
}

interface Props {
  /** The question to display */
  question: Question
  /** The index the user picked, or null if they haven't answered yet */
  selectedIndex: number | null
  /** Called with the chosen option index when the user answers */
  onSelect: (index: number) => void
}
