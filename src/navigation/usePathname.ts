import { useEffect, useState } from "react"
import { NAVIGATION_EVENT } from "@/navigation/constants"

/** Keep React synchronized with in-app navigation and browser back/forward. */
export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    /** Read the current pathname after either kind of history navigation. */
    const handleNavigation = () => setPathname(window.location.pathname)

    window.addEventListener("popstate", handleNavigation)
    window.addEventListener(NAVIGATION_EVENT, handleNavigation)
    return () => {
      window.removeEventListener("popstate", handleNavigation)
      window.removeEventListener(NAVIGATION_EVENT, handleNavigation)
    }
  }, [])

  return pathname
}
