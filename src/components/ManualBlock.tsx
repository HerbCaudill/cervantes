import { ManualCallout } from "@/components/ManualCallout"
import { ManualFigure } from "@/components/ManualFigure"
import { ManualHeading } from "@/components/ManualHeading"
import { ManualList } from "@/components/ManualList"
import { ManualParagraph } from "@/components/ManualParagraph"
import { ManualTable } from "@/components/ManualTable"
import type { ManualAsset, ManualBlock as ManualBlockType } from "@/manual/types"

/** Render one typed semantic manual block with accessible native HTML. */
export function ManualBlock({ block, assets }: Props) {
  switch (block.type) {
    case "heading":
      return <ManualHeading block={block} />
    case "paragraph":
      return <ManualParagraph block={block} />
    case "list":
      return <ManualList block={block} />
    case "table":
      return <ManualTable block={block} />
    case "figure":
      return <ManualFigure block={block} assets={assets} />
    case "callout":
      return <ManualCallout block={block} assets={assets} />
  }
}

interface Props {
  /** Semantic source block */
  block: ManualBlockType
  /** Asset manifest used by figures */
  assets: ManualAsset[]
}
