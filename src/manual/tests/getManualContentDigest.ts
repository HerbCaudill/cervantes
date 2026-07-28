/** Hash canonical JSON content so every ordered value contributes to the result. */
export async function getManualContentDigest(
  /** Structured manual content to hash */
  content: unknown,
): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(content))
  const digest = await crypto.subtle.digest("SHA-256", bytes)

  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("")
}
