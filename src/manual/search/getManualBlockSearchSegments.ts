import type { ManualBlock } from "@/manual/types"

/** Flatten every searchable source string from one semantic manual block. */
export function getManualBlockSearchSegments(
  /** Semantic manual block */
  block: ManualBlock,
): string[] {
  switch (block.type) {
    case "heading":
    case "paragraph":
      return [block.text]
    case "list":
      return block.items
    case "table":
      return [block.caption, ...block.headers, ...block.rows.flat()]
        .filter(value => value !== undefined && value !== null)
        .map(value => String(value))
    case "figure":
      return [block.caption]
    case "callout":
      return [
        ...(block.title ? [block.title] : []),
        ...block.blocks.flatMap(getManualBlockSearchSegments),
      ]
  }
}
