import { NAVIGATION_EVENT } from "@/navigation/constants"

/** Add an in-app destination to browser history and notify the active router. */
export function navigate(
  /** Absolute same-origin application path */
  href: string,
) {
  if (`${window.location.pathname}${window.location.search}` === href) return
  window.history.pushState(null, "", href)
  window.dispatchEvent(new Event(NAVIGATION_EVENT))
}
