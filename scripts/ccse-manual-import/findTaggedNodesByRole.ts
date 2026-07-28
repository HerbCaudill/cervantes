import type { TaggedNode } from "./types.ts"

/** Find descendants with a requested semantic PDF role in source order. */
export function findTaggedNodesByRole(
  /** Root structure node */
  node: TaggedNode,
  /** Semantic role to match */
  role: string,
): TaggedNode[] {
  const matches = node.role === role ? [node] : []
  return [...matches, ...(node.children ?? []).flatMap(child => findTaggedNodesByRole(child, role))]
}
