import { ManualMarginLayout } from "@/components/ManualMarginLayout"
import type { FigureBlock, ManualAsset } from "@/manual/types"

/** Locally bundled source figure with its useful alt text and verbatim caption. */
export function ManualFigure({ block, assets }: Props) {
  const asset = assets.find(candidate => candidate.id === block.assetId)
  if (!asset) return null

  return (
    <ManualMarginLayout>
      <figure className="grid grid-cols-2 items-start gap-3">
        <img
          src={asset.src}
          alt={asset.alt}
          loading="lazy"
          className="bg-paper h-auto max-h-[70dvh] w-full object-contain"
        />
        <figcaption className="text-soft border-rule min-w-0 border-b pb-2 font-sans text-[11px] leading-[1.4]">
          {block.caption}
        </figcaption>
      </figure>
    </ManualMarginLayout>
  )
}

interface Props {
  /** Structured figure source block */
  block: FigureBlock
  /** Asset manifest used to resolve the local image */
  assets: ManualAsset[]
}
