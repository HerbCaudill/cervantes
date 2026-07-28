import { ManualBlock } from "@/components/ManualBlock"
import type { ManualAsset, ManualBlock as ManualBlockType } from "@/manual/types"

/** Render semantic manual blocks in their official source order. */
export function ManualBlockList({ blocks, assets, compact = false }: Props) {
  return (
    <div className={compact ? "flex flex-col gap-3" : "flex flex-col gap-[0.85rem]"}>
      {blocks.map((block, index) => (
        <ManualBlock key={`${block.type}-${index}`} block={block} assets={assets} />
      ))}
    </div>
  )
}

interface Props {
  /** Semantic source blocks in reading order */
  blocks: ManualBlockType[]
  /** Asset manifest used by figures */
  assets: ManualAsset[]
  /** Whether nested block spacing should be tightened */
  compact?: boolean
}
