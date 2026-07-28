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
    <article className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-[0.6rem] px-[0.9rem]">
      <span className="text-red pt-[0.15rem] font-mono text-[10.5px] leading-[1.35] tabular-nums">
        {question.id}
      </span>
      <div className="min-w-0">
        <p className="text-soft mb-[0.85rem] font-sans text-[11px] tracking-[0.14em] uppercase">
          {formatSection(question.section)}
        </p>
        <p className="mb-[0.85rem] font-serif text-xl leading-[1.3]">{question.prompt}</p>

        <div className="border-rule-hard border-t">
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
                  "border-rule flex min-h-11 w-full items-center gap-3 border-b py-2 pr-2 text-left font-serif text-base leading-[1.3] transition-colors",
                  !answered && "hover:bg-rule/40",
                  answered && isCorrect && "text-green",
                  answered && isChosen && !isCorrect && "text-red",
                  answered && !isCorrect && !isChosen && "text-faint",
                )}
              >
                <span aria-hidden="true" className="text-soft w-5 shrink-0 font-mono text-xs">
                  {String.fromCharCode(97 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {answered && isCorrect ?
                  <IconCheck className="size-5 shrink-0" stroke={1.8} aria-hidden="true" />
                : null}
                {answered && isChosen && !isCorrect ?
                  <IconX className="size-5 shrink-0" stroke={1.8} aria-hidden="true" />
                : null}
              </button>
            )
          })}
        </div>

        {answered && question.explanation ?
          <p className="border-red text-soft mt-[0.85rem] border-l-2 pl-3 font-serif text-sm leading-[1.4]">
            {question.explanation}
          </p>
        : null}
      </div>
    </article>
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
