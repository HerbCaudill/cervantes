import { getVisibleManualCalloutTextFragments } from "@/manual/getVisibleManualCalloutTextFragments"
import type { ListBlock, ListItem } from "@/manual/types"

/** Remove repeated prose items from a list nested inside a callout. */
export function getVisibleManualListBlock(
  /** Source list nested inside a callout */
  block: ListBlock,
  /** Normalized searchable strings from non-callout blocks */
  bodySearchSegments: readonly string[],
): ListBlock | null {
  const items = block.items.flatMap<ListItem>(item => {
    if (typeof item === "string") {
      return getVisibleManualCalloutTextFragments(item, bodySearchSegments)
    }

    const children = getVisibleManualListBlock(item.children, bodySearchSegments)
    const parentFragments = getVisibleManualCalloutTextFragments(item.text, bodySearchSegments)

    if (!children) return parentFragments
    if (parentFragments.length === 0) return children.items

    const parentText = parentFragments.at(-1)
    if (!parentText) return children.items
    return [...parentFragments.slice(0, -1), { ...item, text: parentText, children }]
  })

  return items.length > 0 ? { ...block, items } : null
}
