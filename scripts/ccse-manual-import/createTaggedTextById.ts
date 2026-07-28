import type { TaggedTextById } from "./types.ts"

/** Build semantic text lookup data while excluding PDF artifacts and page furniture. */
export function createTaggedTextById(
  /** Marked PDF.js text-content items */
  items: readonly MarkedTextItem[],
): TaggedTextById {
  const textById = new Map<string, Array<{ text: string; x: number; y: number }>>()
  const ids: Array<string | null> = []

  for (const item of items) {
    if ("type" in item) {
      if (item.type === "beginMarkedContent" || item.type === "beginMarkedContentProps") {
        ids.push(item.id ?? null)
      } else if (item.type === "endMarkedContent") {
        ids.pop()
      }
      continue
    }

    const id = ids.at(-1)
    if (!id || !item.str) continue
    const fragments = textById.get(id) ?? []
    fragments.push({ text: item.str, x: item.transform[4], y: item.transform[5] })
    textById.set(id, fragments)
  }

  return textById
}

/** Subset of PDF.js marked-content and text items consumed by the importer. */
type MarkedTextItem =
  | {
      /** Marked-content operator */
      type: string
      /** Tagged content ID, absent for page artifacts */
      id?: string | null
      /** Marked-content tag */
      tag?: string
    }
  | {
      /** Extracted source text */
      str: string
      /** Text transform containing PDF coordinates */
      transform: number[]
    }
