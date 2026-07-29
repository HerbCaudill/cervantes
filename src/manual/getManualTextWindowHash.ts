import { MANUAL_TEXT_WINDOW_HASH_BASE } from "@/manual/constants"

/** Hash one fixed-width UTF-16 text window into an unsigned 32-bit integer. */
export function getManualTextWindowHash(
  /** Complete normalized source text */
  text: string,
  /** Zero-based window start */
  start: number,
  /** Number of UTF-16 characters in the window */
  windowLength: number,
): number {
  let hash = 0

  for (let offset = 0; offset < windowLength; offset += 1) {
    hash = (Math.imul(hash, MANUAL_TEXT_WINDOW_HASH_BASE) + text.charCodeAt(start + offset)) >>> 0
  }

  return hash
}
