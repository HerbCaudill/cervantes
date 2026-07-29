import { useEffect, useState } from "react"
import { NAVIGATION_EVENT } from "@/navigation/constants"

/** Keep React synchronized with routed path and query changes in browser history. */
export function usePathname() {
  const [locationPath, setLocationPath] = useState(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  )

  useEffect(() => {
    /** Read the current routed location after either kind of history navigation. */
    const handleNavigation = () =>
      setLocationPath(`${window.location.pathname}${window.location.search}${window.location.hash}`)

    window.addEventListener("popstate", handleNavigation)
    window.addEventListener("hashchange", handleNavigation)
    window.addEventListener(NAVIGATION_EVENT, handleNavigation)
    return () => {
      window.removeEventListener("popstate", handleNavigation)
      window.removeEventListener("hashchange", handleNavigation)
      window.removeEventListener(NAVIGATION_EVENT, handleNavigation)
    }
  }, [])

  return locationPath
}
