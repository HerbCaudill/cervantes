import { ManualMarginLayout } from "@/components/ManualMarginLayout"
import { getManualMarginNote } from "@/manual/getManualMarginNote"
import type { TableBlock } from "@/manual/types"

/** Semantic source table that becomes labeled records at narrow widths. */
export function ManualTable({ block }: Props) {
  return (
    <ManualMarginLayout note={getManualMarginNote(block.caption ?? "")}>
      <div className="max-w-full overflow-x-auto">
        <table className="manual-responsive-table" data-column-count={block.headers.length}>
          {block.caption ?
            <caption>{block.caption}</caption>
          : null}
          <thead>
            <tr>
              {block.headers.map((header, columnIndex) => (
                <th key={`${header}-${columnIndex}`} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} data-label={block.headers[cellIndex]}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ManualMarginLayout>
  )
}

interface Props {
  /** Structured table source block */
  block: TableBlock
}
