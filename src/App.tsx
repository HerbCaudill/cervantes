import { useState } from "react"
import { DeckHeader } from "@/components/DeckHeader"
import { ReviewSession } from "@/components/ReviewSession"
import { useDeck } from "@/hooks/useDeck"

/** Root of the CCSE practice app: a header plus the current review session. */
export function App() {
  const { dueQuestions, states, totalCount, review } = useDeck()

  // snapshot the due questions once so the session has a stable set to work
  // through, even as states change and `dueQuestions` shrinks underneath it
  const [sessionQuestions] = useState(() => dueQuestions)

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-8 p-6">
      <DeckHeader dueCount={dueQuestions.length} totalCount={totalCount} />
      <main className="flex flex-1 flex-col justify-center">
        <ReviewSession initialQuestions={sessionQuestions} states={states} onReview={review} />
      </main>
    </div>
  )
}
