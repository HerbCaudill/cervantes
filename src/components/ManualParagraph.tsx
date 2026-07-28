import { ManualMarginLayout } from "@/components/ManualMarginLayout"
import { getManualMarginNote } from "@/manual/getManualMarginNote"
import type { ParagraphBlock } from "@/manual/types"

/** Verbatim manual paragraph set at the protected 17px reading size. */
export function ManualParagraph({ block }: Props) {
  return (
    <ManualMarginLayout note={getManualMarginNote(block.text)}>
      <p className="manual-body">{block.text}</p>
    </ManualMarginLayout>
  )
}

interface Props {
  /** Structured paragraph source block */
  block: ParagraphBlock
}
