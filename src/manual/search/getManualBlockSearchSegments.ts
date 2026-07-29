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
      return block.items.flatMap(item =>
        typeof item === "string" ?
          [item]
        : [item.text, ...getManualBlockSearchSegments(item.children)],
      )
    case "table":
      return [block.caption, ...block.headers, ...block.rows.flat()]
        .filter(value => value !== undefined && value !== null)
        .map(value => String(value))
    case "figure":
      return [block.caption]
  }
}
