import { cn } from "@/lib/utils"

/** Compact tick strip showing completed attempts, the current card, and the remaining queue. */
export function QueueStrip({ results, queueLength }: Props) {
  const ticks: Tick[] = [
    ...results,
    ...(queueLength > 0 ? (["current"] as const) : []),
    ...Array.from({ length: Math.max(0, queueLength - 1) }, () => "remaining" as const),
  ]

  return (
    <ol
      aria-label={`${results.length} repasadas, ${queueLength} en la cola`}
      className="flex h-3 gap-px px-[0.9rem]"
    >
      {ticks.map((tick, index) => (
        <li
          key={`${tick}-${index}`}
          aria-hidden="true"
          className={cn(
            "h-1 flex-1",
            tick === "pass" && "bg-green",
            tick === "fail" && "bg-red",
            tick === "current" && "bg-ink",
            tick === "remaining" && "bg-rule-hard",
          )}
        />
      ))}
    </ol>
  )
}

/** One completed or queued attempt in the session. */
export type QueueResult = "pass" | "fail"

type Tick = QueueResult | "current" | "remaining"

interface Props {
  /** Results of attempts already graded */
  results: QueueResult[]
  /** Number of cards in the current queue, including the current card */
  queueLength: number
}
