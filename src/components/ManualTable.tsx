import { ManualFigure } from "@/components/ManualFigure"
import type { ManualAsset, TableBlock } from "@/manual/types"

/** Semantic source table that becomes labeled records at narrow widths. */
export function ManualTable({ block, assets }: Props) {
  const captionMatch = block.caption ? /^TABLA\s+(\d+)\.?\s+(.+)$/s.exec(block.caption) : null
  const tableNumber = captionMatch?.[1]
  const mobileLayout = block.headers.length === 2 || tableNumber === "3" ? "table" : "stacked"

  return (
    <div className="max-w-full overflow-x-auto">
      <table
        className="manual-responsive-table"
        data-column-count={block.headers.length}
        data-mobile-layout={mobileLayout}
      >
        {block.caption ?
          <caption>
            {captionMatch ?
              <>
                <span className="sr-only">{block.caption}</span>
                <span aria-hidden="true">
                  <span className="text-red block">TABLA {captionMatch[1]}.</span>
                  <span className="block">{captionMatch[2]}</span>
                </span>
              </>
            : block.caption}
          </caption>
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
                  <div className="grid min-w-0 gap-3">
                    {cell.text ?
                      <span>{cell.text}</span>
                    : null}
                    {cell.figures?.map(figure => (
                      <ManualFigure key={figure.assetId} block={figure} assets={assets} />
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface Props {
  /** Structured table source block */
  block: TableBlock
  /** Asset manifest used by figures embedded in table cells */
  assets: ManualAsset[]
}
