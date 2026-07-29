import type { ListBlock } from "@/manual/types"

/** Source list preserving flat and nested items verbatim. */
export function ManualList({ block, nested = false }: Props) {
  const List = block.style === "ordered" ? "ol" : "ul"
  const list = (
    <List
      className={
        nested ?
          block.style === "unordered" ?
            "mt-2 flex list-disc flex-col pl-5"
          : "mt-2 flex list-none flex-col pl-4"
        : block.style === "unordered" ?
          "manual-body flex list-disc flex-col pl-5"
        : "manual-body flex list-none flex-col"
      }
    >
      {block.items.map((item, index) => {
        const text = typeof item === "string" ? item : item.text

        return (
          <li
            key={`${index}-${text.slice(0, 24)}`}
            className={nested ? "py-1 first:pt-0" : "border-rule border-b py-2 first:pt-0"}
          >
            {text}
            {typeof item === "object" && <ManualList block={item.children} nested />}
          </li>
        )
      })}
    </List>
  )

  return list
}

interface Props {
  /** Structured list source block */
  block: ListBlock
  /** Whether this list belongs to a parent list item */
  nested?: boolean
}
