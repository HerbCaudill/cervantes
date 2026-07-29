import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { Manual } from "@/manual/types"
import { NAVIGATION_EVENT, NAVIGATION_START_EVENT } from "@/navigation/constants"
import type { AppRoute, NavigationEventDetail, NavigationScrollMode } from "@/navigation/types"
import { READER_STATE_SAVE_DELAY_MS } from "@/reader/constants"
import { getReaderTopicMeasurements } from "@/reader/getReaderTopicMeasurements"
import { loadReaderState } from "@/reader/loadReaderState"
import { openReaderTopic } from "@/reader/openReaderTopic"
import { recordReaderPosition } from "@/reader/recordReaderPosition"
import { saveReaderState } from "@/reader/saveReaderState"
import { scrollToManualAnchor } from "@/reader/scrollToManualAnchor"
import type { ReaderState } from "@/reader/types"

/** Coordinate continuous-reader progress, persistence, and anchor restoration. */
export function useReaderProgress(
  /** Current manual */
  manual: Manual,
  /** Current application route */
  route: AppRoute,
): ReaderProgress {
  const [state, setState] = useState(() => loadReaderState(manual))
  const stateRef = useRef(state)
  const saveTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const scrollFrameRef = useRef<number | null>(null)
  const navigationRef = useRef<NavigationKind>("initial")
  const locationPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
  const activeSection = useMemo(
    () =>
      route.type === "manual-section" ?
        (manual.sections.find(section => section.id === route.sectionId) ?? null)
      : null,
    [manual, route],
  )
  const activeSectionRef = useRef(activeSection)
  activeSectionRef.current = activeSection

  /** Keep React state and synchronous lifecycle state aligned. */
  const updateState = useCallback((nextState: ReaderState) => {
    stateRef.current = nextState
    setState(nextState)
  }, [])

  /** Coalesce storage writes while the reader scrolls. */
  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current !== null) window.clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = window.setTimeout(() => {
      saveTimeoutRef.current = null
      saveReaderState(stateRef.current)
    }, READER_STATE_SAVE_DELAY_MS)
  }, [])

  /** Persist pending reader state immediately. */
  const flush = useCallback(() => {
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    saveReaderState(stateRef.current)
  }, [])

  /** Capture topic-level measurements for the active continuous tarea. */
  const capturePosition = useCallback(() => {
    const section = activeSectionRef.current
    if (!section) return

    const result = getReaderTopicMeasurements(section)
    const measuredState = result.measurements.reduce(
      (nextState, measurement) =>
        recordReaderPosition(
          nextState,
          measurement.topicId,
          measurement.scrollPosition,
          measurement.progress,
        ),
      stateRef.current,
    )
    const nextState =
      result.activeTopicId ? openReaderTopic(measuredState, result.activeTopicId) : measuredState
    updateState(nextState)
    scheduleSave()
  }, [scheduleSave, updateState])

  useEffect(() => {
    /** Capture the current tarea before navigation replaces its document. */
    const handleNavigationStart = (event: Event) => {
      navigationRef.current = (event as CustomEvent<NavigationEventDetail>).detail?.scroll ?? "top"
      capturePosition()
      flush()
    }
    /** Remember scroll intent attached to an in-app link. */
    const handleNavigation = (event: Event) => {
      navigationRef.current = (event as CustomEvent<NavigationEventDetail>).detail?.scroll ?? "top"
    }
    /** Leave restoration for browser history entries to the browser. */
    const handleHistoryNavigation = () => {
      navigationRef.current = "history"
    }

    window.addEventListener(NAVIGATION_START_EVENT, handleNavigationStart)
    window.addEventListener(NAVIGATION_EVENT, handleNavigation)
    window.addEventListener("popstate", handleHistoryNavigation)
    return () => {
      window.removeEventListener(NAVIGATION_START_EVENT, handleNavigationStart)
      window.removeEventListener(NAVIGATION_EVENT, handleNavigation)
      window.removeEventListener("popstate", handleHistoryNavigation)
    }
  }, [capturePosition, flush])

  useLayoutEffect(() => {
    const navigation = navigationRef.current
    navigationRef.current = "initial"
    let cancelAnchorScroll: (() => void) | null = null

    if (activeSection && navigation !== "history") {
      if (window.location.hash) {
        cancelAnchorScroll = scrollToManualAnchor()
      } else {
        scrollFrameRef.current = window.requestAnimationFrame(() => {
          scrollFrameRef.current = null
          window.scrollTo({ top: 0, left: 0, behavior: "auto" })
        })
      }
    } else if (!activeSection && navigation === "top" && !window.location.hash) {
      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null
        window.scrollTo({ top: 0, left: 0, behavior: "auto" })
      })
    }

    return () => {
      cancelAnchorScroll?.()
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current)
        scrollFrameRef.current = null
      }
      flush()
    }
  }, [activeSection, flush, locationPath])

  useEffect(() => {
    if (!activeSection) return

    /** Limit measurements to one per animation frame. */
    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return
      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null
        capturePosition()
      })
    }

    capturePosition()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeSection, capturePosition])

  useEffect(() => {
    /** Flush current progress before the document is suspended or discarded. */
    const handlePageHide = () => {
      capturePosition()
      flush()
    }

    window.addEventListener("pagehide", handlePageHide)
    return () => window.removeEventListener("pagehide", handlePageHide)
  }, [capturePosition, flush])

  useEffect(
    () => () => {
      flush()
    },
    [flush],
  )

  return { state }
}

interface ReaderProgress {
  /** Current reader state, updated automatically while reading */
  state: ReaderState
}

type NavigationKind = NavigationScrollMode | "history" | "initial"
