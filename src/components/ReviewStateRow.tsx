import { MS_PER_DAY } from "@/constants"
import type { ReviewState } from "@/types"

/** Scheduling metadata explaining why the current card is in today's queue. */
export function ReviewStateRow({ state }: Props) {
  const lastSeen =
    state.interval === 0 ?
      "—"
    : new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit" }).format(
        new Date(new Date(state.due).getTime() - state.interval * MS_PER_DAY),
      )

  return (
    <dl className="border-rule-hard grid grid-cols-4 border-y py-2 font-mono tabular-nums">
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-faint text-[10px] tracking-[0.08em] uppercase">Repasos</dt>
        <dd className="text-[12.5px]">{state.repetitions}</dd>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-faint text-[10px] tracking-[0.08em] uppercase">Facil.</dt>
        <dd className="text-[12.5px]">{state.easeFactor.toFixed(2).replace(".", ",")}</dd>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-faint text-[10px] tracking-[0.08em] uppercase">Visto</dt>
        <dd className="text-[12.5px]">{lastSeen}</dd>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-faint text-[10px] tracking-[0.08em] uppercase">Interv.</dt>
        <dd className="text-[12.5px]">{state.interval} d</dd>
      </div>
    </dl>
  )
}

interface Props {
  /** Current persisted scheduling state */
  state: ReviewState
}
