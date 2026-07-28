import { ManualBlockList } from "@/components/ManualBlockList"
import { ManualMarginLayout } from "@/components/ManualMarginLayout"
import type { CalloutBlock, ManualAsset } from "@/manual/types"

/** Source sidebar or highlighted box rendered as an accessible note. */
export function ManualCallout({ block, assets }: Props) {
  return (
    <ManualMarginLayout>
      <div
        role="note"
        aria-label={block.title ?? undefined}
        className="border-rule-hard border-y py-[0.85rem]"
      >
        {block.title ?
          <h3 className="section-label mb-2">{block.title}</h3>
        : null}
        <ManualBlockList blocks={block.blocks} assets={assets} compact />
      </div>
    </ManualMarginLayout>
  )
}

interface Props {
  /** Structured callout source block */
  block: CalloutBlock
  /** Asset manifest used by nested figures */
  assets: ManualAsset[]
}
