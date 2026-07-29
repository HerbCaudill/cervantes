/** Scroll to the current manual topic anchor after React has rendered it. */
export function scrollToManualAnchor(): () => void {
  let cancelled = false

  /** Stop deferred alignment after the reader intentionally takes control. */
  const handleInteraction = () => {
    cancelled = true
  }
  /** Find and align the current decoded hash target. */
  const scroll = () => {
    if (cancelled || !window.location.hash) return
    const anchor = document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
    anchor?.scrollIntoView({ block: "start", behavior: "auto" })
  }

  const frame = window.requestAnimationFrame(scroll)
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>("[data-reader-section] img"),
  )
  images.forEach(image => {
    if (image.complete) return
    image.addEventListener("load", scroll)
    image.addEventListener("error", scroll)
  })
  void document.fonts?.ready.then(scroll)
  const interactionEvents = ["keydown", "pointerdown", "touchstart", "wheel"] as const
  interactionEvents.forEach(eventName =>
    window.addEventListener(eventName, handleInteraction, { passive: true }),
  )

  return () => {
    cancelled = true
    window.cancelAnimationFrame(frame)
    images.forEach(image => {
      image.removeEventListener("load", scroll)
      image.removeEventListener("error", scroll)
    })
    interactionEvents.forEach(eventName => window.removeEventListener(eventName, handleInteraction))
  }
}
