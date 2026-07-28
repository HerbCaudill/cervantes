import { useState } from "react"
import { DeckHeader } from "@/components/DeckHeader"
import { PracticeHome } from "@/components/PracticeHome"
import { ReviewSession } from "@/components/ReviewSession"
import { useDeck } from "@/hooks/useDeck"
import type { Question } from "@/types"

/** Root of the CCSE practice app: a header plus the current review session. */
export function App() {
  const { dueQuestions, states, totalCount, sectionStats, forecast, review } = useDeck()
  const [sessionQuestions, setSessionQuestions] = useState<Question[] | null>(null)

  return (
    <div className="bg-paper text-ink mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <DeckHeader
        dueCount={dueQuestions.length}
        totalCount={totalCount}
        inSession={sessionQuestions !== null}
        onExit={() => setSessionQuestions(null)}
      />
      <main className="flex flex-1 flex-col">
        {sessionQuestions ?
          <ReviewSession
            initialQuestions={sessionQuestions}
            states={states}
            onReview={review}
            onComplete={() => setSessionQuestions(null)}
          />
        : <PracticeHome
            stats={sectionStats}
            forecast={forecast}
            dueCount={dueQuestions.length}
            onStart={() => setSessionQuestions(dueQuestions)}
          />
        }
      </main>
    </div>
  )
}
