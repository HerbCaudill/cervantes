import type { FigureBlock, ManualAsset } from "@/manual/types"

/** Locally bundled source figure with its useful alt text and verbatim caption. */
export function ManualFigure({ block, assets }: Props) {
  const asset = assets.find(candidate => candidate.id === block.assetId)
  if (!asset) return null
  const figureNumber = /^(FIGURA \d+\.)/.exec(block.caption)?.[1] ?? null
  const descriptionStart = figureNumber?.length ?? 0
  const creditStart = block.caption.indexOf("©", descriptionStart)
  const description = block.caption.slice(
    descriptionStart,
    creditStart === -1 ? undefined : creditStart,
  )
  const credit = creditStart === -1 ? null : block.caption.slice(creditStart)

  return (
    <figure className="flex items-start gap-3">
      <img
        src={asset.src}
        alt={asset.alt}
        loading="lazy"
        className="bg-paper h-auto max-h-[70dvh] w-auto max-w-[50%] shrink-0 object-contain"
      />
      <figcaption className="text-soft min-w-0 flex-1 font-sans text-[11px] leading-[1.4]">
        {figureNumber ?
          <span className="text-red block">{figureNumber}</span>
        : null}
        {description ?
          <span className="block">{description}</span>
        : null}
        {credit ?
          <span className="text-faint block">{credit}</span>
        : null}
      </figcaption>
    </figure>
  )
}

interface Props {
  /** Structured figure source block */
  block: FigureBlock
  /** Asset manifest used to resolve the local image */
  assets: ManualAsset[]
}
