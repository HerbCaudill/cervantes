import type { DraftManualSection } from "./types.ts"

/** Embed row-associated source figures inside their semantic table cells. */
export function embedTableRowFigures(
  /** Manual sections whose figures and tables may span source-page topics */
  sections: DraftManualSection[],
): DraftManualSection[] {
  /** Intended table number and first-column row text for each row-associated figure. */
  const targets = new Map<number, readonly [tableNumber: number, rowText: string]>([
    [47, [5, "1252"]],
    [48, [5, "1492"]],
    [49, [5, "Siglos XVI-XVII"]],
    [50, [5, "1936-1939"]],
    [51, [5, "1936-1939"]],
    [52, [5, "1939-1975"]],
    [53, [5, "1978"]],
    [54, [5, "1992"]],
    [55, [6, "Fallas de Valencia"]],
    [58, [6, "Semana Santa"]],
    [59, [6, "Sant Jordi"]],
    [60, [6, "La Tomatina"]],
    [61, [6, "Sanfermines"]],
    [75, [8, "Educación Infantil"]],
  ])
  /** Header signatures used when a continued source table has no repeated caption. */
  const tableHeaders = new Map<number, readonly string[]>([
    [5, ["Fecha", "Época histórica", "Descripción"]],
    [6, ["Fiestas", "Fecha y localidad", "Símbolos relacionados con las fiestas"]],
    [8, ["Nivel educativo", "Descripción"]],
  ])
  /** Row figures indexed by source figure number. */
  const figures = new Map(
    sections.flatMap(section =>
      section.topics.flatMap(topic =>
        topic.blocks.flatMap(block => {
          if (block.type !== "figure") return []
          const match = /^FIGURA\s*(\d+)/i.exec(block.caption)
          const figureNumber = match ? Number(match[1]) : null
          return figureNumber !== null && targets.has(figureNumber) ?
              [[figureNumber, block] as const]
            : []
        }),
      ),
    ),
  )
  /** Figure assets successfully embedded in a table cell. */
  const embeddedAssetIds = new Set<string>()

  const withEmbeddedFigures = sections.map(section => ({
    ...section,
    topics: section.topics.map(topic => ({
      ...topic,
      blocks: topic.blocks.map(block => {
        if (block.type !== "table") return block

        const captionNumber = Number(/^TABLA\s+(\d+)/i.exec(block.caption ?? "")?.[1])
        const tableNumber =
          tableHeaders.has(captionNumber) ? captionNumber : (
            Array.from(tableHeaders).find(([, headers]) =>
              headers.every((header, index) => block.headers[index] === header),
            )?.[0]
          )
        if (tableNumber === undefined) return block

        const headers =
          tableNumber === 8 && block.headers.length === 2 ?
            [...block.headers, "Imagen"]
          : block.headers
        const rows = block.rows.map(row => {
          const normalizedRow =
            tableNumber === 8 && row.length === 2 ? [...row, { text: null }] : row
          const rowFigures = Array.from(targets)
            .filter(
              ([, [targetTableNumber, rowText]]) =>
                targetTableNumber === tableNumber && normalizedRow[0]?.text === rowText,
            )
            .flatMap(([figureNumber]) => {
              const figure = figures.get(figureNumber)
              return figure && !embeddedAssetIds.has(figure.assetId) ? [figure] : []
            })
          if (rowFigures.length === 0) return normalizedRow

          rowFigures.forEach(figure => embeddedAssetIds.add(figure.assetId))
          return normalizedRow.map((cell, columnIndex) =>
            columnIndex === 2 ?
              {
                ...cell,
                figures: [...(cell.figures ?? []), ...rowFigures],
              }
            : cell,
          )
        })

        return { ...block, headers, rows }
      }),
    })),
  }))

  return withEmbeddedFigures.map(section => ({
    ...section,
    topics: section.topics.map(topic => ({
      ...topic,
      blocks: topic.blocks.filter(
        block => block.type !== "figure" || !embeddedAssetIds.has(block.assetId),
      ),
    })),
  }))
}
