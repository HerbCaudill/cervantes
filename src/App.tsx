import { useState } from "react"
import { DeckHeader } from "@/components/DeckHeader"
import { ManualNotFound } from "@/components/ManualNotFound"
import { ManualScreen } from "@/components/ManualScreen"
import { PracticeHome } from "@/components/PracticeHome"
import { ReviewSession } from "@/components/ReviewSession"
import { useDeck } from "@/hooks/useDeck"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual } from "@/manual/types"
import { parseRoute } from "@/navigation/parseRoute"
import { usePathname } from "@/navigation/usePathname"
import type { Question } from "@/types"

/** Root of the CCSE app: shared chrome plus the routed practice or manual screen. */
export function App() {
  const { dueQuestions, states, totalCount, sectionStats, forecast, review } = useDeck()
  const [sessionQuestions, setSessionQuestions] = useState<Question[] | null>(null)
  const route = parseRoute(usePathname())
  const activeDestination = route.type.startsWith("manual") ? "manual" : "practice"

  return (
    <div className="bg-paper text-ink mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <DeckHeader
        dueCount={dueQuestions.length}
        totalCount={totalCount}
        activeDestination={activeDestination}
        inSession={sessionQuestions !== null}
        onExit={() => setSessionQuestions(null)}
      />
      <main className="flex flex-1 flex-col">
        <div
          className={
            activeDestination === "practice" && route.type !== "not-found" ? "contents" : "hidden"
          }
        >
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
        </div>
        {route.type === "not-found" ?
          <ManualNotFound />
        : activeDestination === "manual" ?
          <ManualScreen manual={manualDraft as Manual} route={route} />
        : null}
      </main>
    </div>
  )
}
