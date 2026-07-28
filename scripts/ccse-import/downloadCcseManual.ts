import { MANUAL_URL } from "./constants.ts"

/** Download the official CCSE preparation manual as PDF bytes. */
export async function downloadCcseManual(): Promise<Uint8Array> {
  const response = await fetch(MANUAL_URL)
  if (!response.ok) {
    throw new Error(`Could not download CCSE manual: ${response.status} ${response.statusText}`)
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/pdf")) {
    throw new Error(
      `Expected a PDF from ${MANUAL_URL}, received ${contentType || "no content type"}`,
    )
  }

  return new Uint8Array(await response.arrayBuffer())
}
