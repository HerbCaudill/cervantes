import { MANUAL_TEXT_WINDOW_HASH_BASE } from "@/manual/constants"

/** Advance a fixed-width unsigned 32-bit rolling hash by one character. */
export function getNextManualTextWindowHash(
  /** Hash of the current window */
  currentHash: number,
  /** UTF-16 code unit leaving the window */
  outgoingCharacter: number,
  /** UTF-16 code unit entering the window */
  incomingCharacter: number,
  /** Leading-character multiplier for this window width */
  leadingPower: number,
): number {
  const withoutOutgoing = (currentHash - Math.imul(outgoingCharacter, leadingPower)) >>> 0

  return (Math.imul(withoutOutgoing, MANUAL_TEXT_WINDOW_HASH_BASE) + incomingCharacter) >>> 0
}
