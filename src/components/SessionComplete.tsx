import { IconCircleCheck } from "@tabler/icons-react"

/** Shown when the review queue is empty — either all caught up or session done. */
export function SessionComplete({ reviewedCount }: Props) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
      <IconCircleCheck className="text-primary size-12" stroke={1.5} />
      <h2 className="text-xl font-medium">
        {reviewedCount > 0 ? "Repaso terminado" : "Todo al día"}
      </h2>
      <p className="text-muted-foreground">
        {reviewedCount > 0 ?
          `Has repasado ${reviewedCount} ${reviewedCount === 1 ? "pregunta" : "preguntas"}.`
        : "No hay preguntas pendientes ahora mismo."}
      </p>
    </div>
  )
}

interface Props {
  /** How many cards were graded this session */
  reviewedCount: number
}
