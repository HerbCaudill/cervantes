import { isDuplicatedManualCalloutText } from "@/manual/isDuplicatedManualCalloutText"
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
      return isDuplicatedManualCalloutText(item, bodySearchSegments) ? [] : [item]
    }

    const children = getVisibleManualListBlock(item.children, bodySearchSegments)
    const repeatedParent = isDuplicatedManualCalloutText(item.text, bodySearchSegments)

    if (!children) return repeatedParent ? [] : [item.text]
    return [{ ...item, children }]
  })

  return items.length > 0 ? { ...block, items } : null
}
