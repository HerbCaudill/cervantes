import { SECTION_LABELS } from "@/constants"

/**
 * Turn a section key into a human label. Known keys use their entry in
 * `SECTION_LABELS`; unknown keys fall back to a title-cased version of the key
 * (so an imported bank can introduce new sections without code changes).
 */
export function formatSection(
  /** The section key from a question */
  section: string,
): string {
  if (SECTION_LABELS[section]) return SECTION_LABELS[section]
  return section
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
