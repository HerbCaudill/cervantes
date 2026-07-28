import type { ManualBodyTextIndex } from "@/manual/types"

/** Index every fixed-width normalized window from the manual body corpus. */
export function createManualBodyTextIndex(
  /** Normalized non-callout text segments */
  bodySearchSegments: readonly string[],
  /** Character width required for a substantial match */
  windowLength: number,
): ManualBodyTextIndex {
  const windows = new Set<string>()

  for (const segment of bodySearchSegments) {
    for (let start = 0; start <= segment.length - windowLength; start += 1) {
      windows.add(segment.slice(start, start + windowLength))
    }
  }

  return { windowLength, windows }
}
