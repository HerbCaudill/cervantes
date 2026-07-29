/** Continuous progress through the cards in the initial review queue. */
export function QueueStrip({ completedCount, totalCount }: Props) {
  const completed = Math.min(Math.max(completedCount, 0), totalCount)
  const percentage = totalCount === 0 ? 0 : (completed / totalCount) * 100

  return (
    <div
      role="progressbar"
      aria-label="Progreso del repaso"
      aria-valuemin={0}
      aria-valuemax={totalCount}
      aria-valuenow={completed}
      aria-valuetext={`${completed} de ${totalCount} tarjetas completadas`}
      className="bg-rule-hard mx-[0.9rem] mb-3 h-2 overflow-hidden rounded-full"
    >
      <div
        aria-hidden="true"
        className="bg-ink h-full transition-[width] duration-200"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

interface Props {
  /** Number of initial cards no longer in the review queue */
  completedCount: number
  /** Number of cards in the queue when the session began */
  totalCount: number
}
