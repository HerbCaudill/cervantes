import { useState } from "react"
import { DeckNavigation } from "@/components/DeckNavigation"
import { ManualNotFound } from "@/components/ManualNotFound"
import { ManualScreen } from "@/components/ManualScreen"
import { PracticeHome } from "@/components/PracticeHome"
import { ReviewSession } from "@/components/ReviewSession"
import { useDeck } from "@/hooks/useDeck"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual } from "@/manual/types"
import { parseRoute } from "@/navigation/parseRoute"
import { usePathname } from "@/navigation/usePathname"
import { useReaderProgress } from "@/reader/useReaderProgress"
import type { Question } from "@/types"

/** Root of the CCSE app: render shared navigation and the current routed screen. */
export function App() {
  const { dueQuestions, sectionStats, review } = useDeck()
  const [sessionQuestions, setSessionQuestions] = useState<Question[] | null>(null)
  const manual = manualDraft as Manual
  const route = parseRoute(usePathname())
  const readerProgress = useReaderProgress(manual, route)
  const activeDestination = route.type.startsWith("manual") ? "manual" : "practice"

  return (
    <div className="bg-paper text-ink mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <DeckNavigation activeDestination={activeDestination} />
      <main className="flex flex-1 flex-col">
        <div
          className={
            activeDestination === "practice" && route.type !== "not-found" ? "contents" : "hidden"
          }
        >
          {sessionQuestions ?
            <ReviewSession
              initialQuestions={sessionQuestions}
              onReview={review}
              onComplete={() => setSessionQuestions(null)}
            />
          : <PracticeHome
              stats={sectionStats}
              dueCount={dueQuestions.length}
              onStart={() => setSessionQuestions(dueQuestions)}
            />
          }
        </div>
        {route.type === "not-found" ?
          <ManualNotFound />
        : activeDestination === "manual" ?
          <ManualScreen manual={manual} route={route} readerState={readerProgress.state} />
        : null}
      </main>
    </div>
  )
}
