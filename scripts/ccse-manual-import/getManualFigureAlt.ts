import { STANDALONE_FIGURE_ALTS } from "./constants.ts"

/** Derive useful alternative text without changing the verbatim source caption. */
export function getManualFigureAlt(
  /** Stable local figure asset ID */
  assetId: string,
  /** Verbatim source caption */
  caption: string,
): string {
  return STANDALONE_FIGURE_ALTS[assetId] ?? caption.replace(/^FIGURA\s*\d+\.?\s*/i, "")
}
