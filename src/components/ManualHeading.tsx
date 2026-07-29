import type { HeadingBlock } from "@/manual/types"

/** Source subheading within a manual topic. */
export function ManualHeading({ block }: Props) {
  return (
    <h3 className="font-serif text-[19px] leading-[1.25] font-bold text-balance">{block.text}</h3>
  )
}

interface Props {
  /** Structured heading source block */
  block: HeadingBlock
}
