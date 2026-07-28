/** Measure the current window offset and fractional document progress. */
export function getCurrentReaderPosition(): CurrentReaderPosition {
  const scrollPosition = Math.max(0, window.scrollY)
  const maximumScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

  return {
    scrollPosition,
    progress: maximumScroll === 0 ? 1 : Math.min(1, scrollPosition / maximumScroll),
  }
}

interface CurrentReaderPosition {
  /** Current vertical document offset */
  scrollPosition: number
  /** Current fractional progress from zero to one */
  progress: number
}
