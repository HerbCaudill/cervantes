import type { TableBlock } from "@/manual/types"

/** Semantic source table that becomes labeled records at narrow widths. */
export function ManualTable({ block }: Props) {
  const captionMatch = block.caption ? /^TABLA\s+(\d+)\.?\s+(.+)$/s.exec(block.caption) : null

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="manual-responsive-table" data-column-count={block.headers.length}>
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
                  {cell}
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
}
