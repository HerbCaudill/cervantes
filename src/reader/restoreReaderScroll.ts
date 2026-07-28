/** Restore a saved offset again as deferred fonts and topic figures establish layout. */
export function restoreReaderScroll(
  /** Saved vertical document offset */
  top: number,
): () => void {
  let interrupted = false

  /** Stop deferred restoration as soon as the reader intentionally interacts. */
  const handleInteraction = () => {
    interrupted = true
  }
  /** Reapply the saved offset unless the reader has taken control. */
  const restore = () => {
    if (interrupted) return
    window.scrollTo({ top, left: 0, behavior: "auto" })
  }

  const frame = window.requestAnimationFrame(restore)
  const images = Array.from(document.querySelectorAll<HTMLImageElement>("[data-reader-topic] img"))
  images.forEach(image => {
    if (image.complete) return
    image.loading = "eager"
    image.addEventListener("load", restore)
    image.addEventListener("error", restore)
  })
  void document.fonts?.ready.then(restore)

  const interactionEvents = ["keydown", "pointerdown", "touchstart", "wheel"] as const
  interactionEvents.forEach(eventName =>
    window.addEventListener(eventName, handleInteraction, { passive: true }),
  )

  return () => {
    interrupted = true
    window.cancelAnimationFrame(frame)
    images.forEach(image => {
      image.removeEventListener("load", restore)
      image.removeEventListener("error", restore)
    })
    interactionEvents.forEach(eventName => window.removeEventListener(eventName, handleInteraction))
  }
}
