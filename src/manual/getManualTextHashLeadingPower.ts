import { MANUAL_TEXT_WINDOW_HASH_BASE } from "@/manual/constants"

/** Calculate the leading-character multiplier for a fixed-width rolling hash. */
export function getManualTextHashLeadingPower(
  /** Number of characters in each hashed window */
  windowLength: number,
): number {
  let power = 1

  for (let offset = 1; offset < windowLength; offset += 1) {
    power = Math.imul(power, MANUAL_TEXT_WINDOW_HASH_BASE) >>> 0
  }

  return power
}
