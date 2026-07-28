import { ManualMarginLayout } from "@/components/ManualMarginLayout"
import { getManualMarginNote } from "@/manual/getManualMarginNote"
import type { ListBlock } from "@/manual/types"

/** Ordered or unordered source list preserving every extracted item verbatim. */
export function ManualList({ block }: Props) {
  const List = block.style === "ordered" ? "ol" : "ul"

  return (
    <ManualMarginLayout note={getManualMarginNote(block.items.join(" "))}>
      <List
        className={
          block.style === "ordered" ?
            "manual-body flex list-none flex-col"
          : "manual-body flex list-disc flex-col pl-5"
        }
      >
        {block.items.map((item, index) => (
          <li
            key={`${index}-${item.slice(0, 24)}`}
            className="border-rule border-b py-2 first:pt-0"
          >
            {item}
          </li>
        ))}
      </List>
    </ManualMarginLayout>
  )
}

interface Props {
  /** Structured list source block */
  block: ListBlock
}
