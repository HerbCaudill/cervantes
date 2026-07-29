import type { ParagraphBlock } from "@/manual/types"

/** Verbatim manual paragraph set in the shared compact reading style. */
export function ManualParagraph({ block }: Props) {
  return <p className="manual-body">{block.text}</p>
}

interface Props {
  /** Structured paragraph source block */
  block: ParagraphBlock
}
