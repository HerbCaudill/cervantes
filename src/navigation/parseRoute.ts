import type { AppRoute } from "@/navigation/types"

/** Match an application pathname to a practice or manual destination. */
export function parseRoute(
  /** Browser pathname */
  pathname: string,
): AppRoute {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/"

  if (normalizedPath === "/" || normalizedPath === "/practica") return { type: "practice" }
  if (normalizedPath === "/manual") return { type: "manual-index" }
  if (normalizedPath === "/manual/buscar") return { type: "manual-search" }

  const segments = normalizedPath.split("/").filter(Boolean)
  if (segments[0] !== "manual") return { type: "not-found" }
  if (segments.length === 2) return { type: "manual-section", sectionId: segments[1] }
  if (segments.length === 3) {
    return {
      type: "manual-topic",
      sectionId: segments[1],
      topicSlug: segments[2],
    }
  }

  return { type: "not-found" }
}
