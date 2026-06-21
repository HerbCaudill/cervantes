import type { Card } from "@/types"

/**
 * A single study card. Shows the Spanish prompt; when `revealed` is false the
 * whole card is a button that calls `onReveal`. Once revealed it shows the
 * answer and any example sentence.
 */
export function FlashCard({ card, revealed, onReveal }: Props) {
  return (
    <button
      type="button"
      onClick={revealed ? undefined : onReveal}
      aria-label="Flash card"
      className="bg-card text-card-foreground flex min-h-64 w-full flex-col items-center justify-center gap-4 rounded-xl border p-8 text-center shadow-sm transition enabled:hover:shadow-md disabled:cursor-default"
      disabled={revealed}
    >
      <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
        {card.category}
      </span>
      <span className="font-serif text-3xl font-medium">{card.front}</span>

      {revealed ?
        <>
          <hr className="border-border w-12" />
          <span className="text-2xl">{card.back}</span>
          {card.example ?
            <p className="text-muted-foreground text-base italic">{card.example}</p>
          : null}
        </>
      : <span className="text-muted-foreground mt-2 text-sm">Tap to show answer</span>}
    </button>
  )
}

interface Props {
  /** The card to display */
  card: Card
  /** Whether the answer side is currently shown */
  revealed: boolean
  /** Called when the user taps an unrevealed card to flip it */
  onReveal: () => void
}
