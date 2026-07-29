import { NAVIGATION_EVENT, NAVIGATION_START_EVENT } from "@/navigation/constants"
import type { NavigationEventDetail, NavigationScrollMode } from "@/navigation/types"

/** Add an in-app destination to browser history and notify the active router. */
export function navigate(
  /** Absolute same-origin application path */
  href: string,
  /** Scroll behavior for the destination */
  scroll: NavigationScrollMode = "top",
) {
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` === href) return
  const detail: NavigationEventDetail = { scroll }
  window.dispatchEvent(new CustomEvent<NavigationEventDetail>(NAVIGATION_START_EVENT, { detail }))
  window.history.pushState(null, "", href)
  window.dispatchEvent(
    new CustomEvent<NavigationEventDetail>(NAVIGATION_EVENT, {
      detail,
    }),
  )
}
