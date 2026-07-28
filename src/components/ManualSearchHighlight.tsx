import { Fragment } from "react"
import { getManualSearchHighlightParts } from "@/manual/search/getManualSearchHighlightParts"

/** Render original source text with query matches as safe React text nodes. */
export function ManualSearchHighlight({ text, query }: Props) {
  return getManualSearchHighlightParts(text, query).map((part, index) => (
    <Fragment key={`${index}-${part.text}`}>
      {part.highlighted ?
        <mark className="bg-red/15 text-ink decoration-red underline decoration-1 underline-offset-2">
          {part.text}
        </mark>
      : part.text}
    </Fragment>
  ))
}

interface Props {
  /** Original source text */
  text: string
  /** Reader-entered query */
  query: string
}
