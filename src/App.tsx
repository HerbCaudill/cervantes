import { useState } from "react"
import { DeckHeader } from "@/components/DeckHeader"
import { ReviewSession } from "@/components/ReviewSession"
import { useDeck } from "@/hooks/useDeck"

/** Root of the DELE flash-card app: a header plus the current review session. */
export function App() {
  const { dueCards, states, totalCount, review } = useDeck()

  // snapshot the due cards once so the session has a stable set to work through,
  // even as states change and `dueCards` shrinks underneath it
  const [sessionCards] = useState(() => dueCards)

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-8 p-6">
      <DeckHeader dueCount={dueCards.length} totalCount={totalCount} />
      <main className="flex flex-1 flex-col justify-center">
        <ReviewSession initialCards={sessionCards} states={states} onReview={review} />
      </main>
    </div>
  )
}
