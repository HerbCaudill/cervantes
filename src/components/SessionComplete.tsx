import { IconCircleCheck } from "@tabler/icons-react"

/** Shown when the review queue is empty — either all caught up or session done. */
export function SessionComplete({ reviewedCount }: Props) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
      <IconCircleCheck className="text-primary size-12" stroke={1.5} />
      <h2 className="text-xl font-medium">
        {reviewedCount > 0 ? "Session complete" : "All caught up"}
      </h2>
      <p className="text-muted-foreground">
        {reviewedCount > 0 ?
          `You reviewed ${reviewedCount} ${reviewedCount === 1 ? "card" : "cards"}. ¡Buen trabajo!`
        : "No cards are due right now. Check back later."}
      </p>
    </div>
  )
}

interface Props {
  /** How many cards were graded this session */
  reviewedCount: number
}
