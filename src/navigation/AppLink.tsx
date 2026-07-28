import type { MouseEvent, ReactNode } from "react"
import { navigate } from "@/navigation/navigate"

/** Same-origin link that preserves browser history without reloading the app. */
export function AppLink({ href, children, className, ariaCurrent, restoreScroll }: Props) {
  /** Use native link behavior for modified clicks and in-app history otherwise. */
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.currentTarget.target
    ) {
      return
    }

    event.preventDefault()
    navigate(href, restoreScroll ? "restore" : "top")
  }

  return (
    <a href={href} className={className} aria-current={ariaCurrent} onClick={handleClick}>
      {children}
    </a>
  )
}

interface Props {
  /** Absolute application path */
  href: string
  /** Visible link content */
  children: ReactNode
  /** Optional visual classes */
  className?: string
  /** Current-page state for navigation links */
  ariaCurrent?: "page"
  /** Restore saved reader progress instead of starting the destination at its top */
  restoreScroll?: boolean
}
