import { IconCards } from "@tabler/icons-react"

/** App header: title and a live count of questions due versus the bank total. */
export function DeckHeader({ dueCount, totalCount }: Props) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <IconCards className="text-primary size-6" stroke={1.5} />
        <h1 className="text-lg font-semibold">CCSE practice</h1>
      </div>
      <span className="text-muted-foreground text-sm">
        {dueCount} due · {totalCount} total
      </span>
    </header>
  )
}

interface Props {
  /** Number of questions currently due for review */
  dueCount: number
  /** Total number of questions in the bank */
  totalCount: number
}
