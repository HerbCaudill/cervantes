import { createHash } from "node:crypto"

/** Calculate a SHA-256 digest for downloaded source bytes. */
export function hashBytes(
  /** Bytes to hash */
  bytes: Uint8Array,
): string {
  return createHash("sha256").update(bytes).digest("hex")
}
