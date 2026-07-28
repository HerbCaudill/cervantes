import { ManualMarginLayout } from "@/components/ManualMarginLayout"
import { getManualMarginNote } from "@/manual/getManualMarginNote"
import type { HeadingBlock } from "@/manual/types"

/** Source subheading with article labels repeated unobtrusively in the margin. */
export function ManualHeading({ block }: Props) {
  const Heading = block.level === 2 ? "h3" : "h4"

  return (
    <ManualMarginLayout note={getManualMarginNote(block.text)}>
      <Heading className="font-serif text-[19px] leading-[1.25] font-bold text-balance">
        {block.text}
      </Heading>
    </ManualMarginLayout>
  )
}

interface Props {
  /** Structured heading source block */
  block: HeadingBlock
}
