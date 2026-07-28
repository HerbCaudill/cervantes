import { getVisibleManualCalloutTextFragments } from "@/manual/getVisibleManualCalloutTextFragments"
import type { ListBlock, ListItem, ManualBodyTextIndex } from "@/manual/types"

/** Remove repeated prose items from a list nested inside a callout. */
export function getVisibleManualListBlock(
  /** Source list nested inside a callout */
  block: ListBlock,
  /** Fixed-width normalized body-window index */
  bodyTextIndex: ManualBodyTextIndex,
): ListBlock | null {
  const items = block.items.flatMap<ListItem>(item => {
    if (typeof item === "string") {
      return getVisibleManualCalloutTextFragments(item, bodyTextIndex)
    }

    const children = getVisibleManualListBlock(item.children, bodyTextIndex)
    const parentFragments = getVisibleManualCalloutTextFragments(item.text, bodyTextIndex)

    if (!children) return parentFragments
    if (parentFragments.length === 0) return children.items

    const parentText = parentFragments.at(-1)
    if (!parentText) return children.items
    return [...parentFragments.slice(0, -1), { ...item, text: parentText, children }]
  })

  return items.length > 0 ? { ...block, items } : null
}
