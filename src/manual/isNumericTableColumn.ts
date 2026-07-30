import type { TableCell } from "@/manual/types"

/** Words allowed inside a complete numeric expression, including common measurement units. */
const NUMERIC_EXPRESSION_WORDS =
  /\b(?:a|al|años?|centímetros?|cl|créditos?|cuartos?|d|de|decímetros?|días?|dl|dm|g|gramos?|h|ha|horas?|kg|kilogramos?|kilos?|kilómetros?|km|l|litros?|m|medio|metros?|mg|miligramos?|milímetros?|min|minutos?|ml|s|segundos?|siglos?|t|toneladas?|tres|un)\b/giu

/** Characters that can remain after measurement words are removed from a numeric expression. */
const NUMERIC_EXPRESSION_CHARACTERS = /^[\dIVXLCDM\s.,'’+\-–—/:=×±()%‰€$º°]*$/iu

/** Determine whether every populated, media-free cell in a table column is numeric. */
export function isNumericTableColumn(
  /** Cells from one structured table column */
  cells: TableCell[],
): boolean {
  const populatedCells = cells.filter(cell => cell.text?.trim())

  if (populatedCells.length === 0 || cells.some(cell => cell.figures?.length)) return false

  return populatedCells.every(cell => {
    const text = cell.text?.normalize("NFKC").trim() ?? ""
    const hasNumericValue = /\d/u.test(text) || /^siglos?\s+[IVXLCDM]+/iu.test(text)
    const remainingCharacters = text.replace(NUMERIC_EXPRESSION_WORDS, "")

    return hasNumericValue && NUMERIC_EXPRESSION_CHARACTERS.test(remainingCharacters)
  })
}
