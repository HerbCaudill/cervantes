import type { ReactNode } from "react"

/** Fixed-width marginal column paired with a reader block that keeps one body measure. */
export function ManualMarginLayout({ note, children, className }: Props) {
  return (
    <div className={`manual-marginal-row ${className ?? ""}`}>
      <span
        className="text-red min-w-0 self-start pt-1 font-mono text-[10.5px] leading-[1.35] break-words tabular-nums"
        data-margin-note={note ?? undefined}
        aria-hidden="true"
      >
        {note}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

interface Props {
  /** Verbatim or source-derived note shown in the fixed column */
  note?: string | null
  /** Main reader content */
  children: ReactNode
  /** Optional row-specific styling */
  className?: string
}
