import { execFile } from "node:child_process"
import { promisify } from "node:util"
import type { FigureCrop } from "./types.ts"

const execFileAsync = promisify(execFile)

/** Render a source figure crop to a deterministic local JPEG with Poppler. */
export async function renderFigureCrop(
  /** Temporary source PDF path */
  pdfPath: string,
  /** Figure crop in source coordinates */
  crop: FigureCrop,
  /** Output path without the `.png` extension */
  outputPrefix: string,
  /** Source PDF page height in points */
  pageHeight: number,
): Promise<void> {
  const scale = 2
  const [left, bottom, right, top] = crop.bounds
  const x = Math.max(0, Math.floor(left * scale))
  const y = Math.max(0, Math.floor((pageHeight - top) * scale))
  const width = Math.max(1, Math.ceil((right - left) * scale))
  const height = Math.max(1, Math.ceil((top - bottom) * scale))

  await execFileAsync("pdftoppm", [
    "-f",
    String(crop.pageNumber),
    "-l",
    String(crop.pageNumber),
    "-r",
    "144",
    "-x",
    String(x),
    "-y",
    String(y),
    "-W",
    String(width),
    "-H",
    String(height),
    "-jpeg",
    "-jpegopt",
    "quality=90,optimize=y,progressive=n",
    "-singlefile",
    pdfPath,
    outputPrefix,
  ])
}
