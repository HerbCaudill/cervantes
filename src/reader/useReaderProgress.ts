import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { findManualTopicBySlug } from "@/manual/findManualTopicBySlug"
import type { Manual } from "@/manual/types"
import { NAVIGATION_EVENT, NAVIGATION_START_EVENT } from "@/navigation/constants"
import type { AppRoute, NavigationEventDetail, NavigationScrollMode } from "@/navigation/types"
import { READER_STATE_SAVE_DELAY_MS } from "@/reader/constants"
import { getCurrentReaderPosition } from "@/reader/getCurrentReaderPosition"
import { getReaderResumePath } from "@/reader/getReaderResumePath"
import { loadReaderState } from "@/reader/loadReaderState"
import { openReaderTopic } from "@/reader/openReaderTopic"
import { recordReaderPosition } from "@/reader/recordReaderPosition"
import { restoreReaderScroll } from "@/reader/restoreReaderScroll"
import { saveReaderState } from "@/reader/saveReaderState"
import type { ReaderState } from "@/reader/types"

/** Coordinate reader progress, throttled persistence, and intentional scroll restoration. */
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
  const routePath = window.location.pathname
  const activeTopicId = useMemo(() => {
    if (route.type !== "manual-topic") return null
    const section = manual.sections.find(candidate => candidate.id === route.sectionId)
    return section ? (findManualTopicBySlug(section, route.topicSlug)?.id ?? null) : null
  }, [manual, route])
  const activeTopicIdRef = useRef(activeTopicId)
  activeTopicIdRef.current = activeTopicId

  /** Keep the React snapshot and the synchronous lifecycle snapshot aligned. */
  const updateState = useCallback((nextState: ReaderState) => {
    stateRef.current = nextState
    setState(nextState)
  }, [])

  /** Coalesce scroll-driven storage updates onto a low-frequency timer. */
  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current !== null) window.clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = window.setTimeout(() => {
      saveTimeoutRef.current = null
      saveReaderState(stateRef.current)
    }, READER_STATE_SAVE_DELAY_MS)
  }, [])

  /** Persist the latest synchronous state immediately at a lifecycle boundary. */
  const flush = useCallback(() => {
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    saveReaderState(stateRef.current)
  }, [])

  /** Capture the active topic's offset and monotonic reading progress. */
  const capturePosition = useCallback(
    (topicId: string) => {
      const position = getCurrentReaderPosition()
      updateState(
        recordReaderPosition(stateRef.current, topicId, position.scrollPosition, position.progress),
      )
      scheduleSave()
    },
    [scheduleSave, updateState],
  )

  useEffect(() => {
    /** Capture the current topic before navigation can shorten or replace its document. */
    const handleNavigationStart = (event: Event) => {
      navigationRef.current = (event as CustomEvent<NavigationEventDetail>).detail?.scroll ?? "top"
      if (!activeTopicIdRef.current) return
      capturePosition(activeTopicIdRef.current)
      flush()
    }
    /** Remember scroll intent attached to an in-app link. */
    const handleNavigation = (event: Event) => {
      navigationRef.current = (event as CustomEvent<NavigationEventDetail>).detail?.scroll ?? "top"
    }
    /** Let the browser restore its own history entry without competing scroll calls. */
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

    if (!activeTopicId) {
      if (navigation === "top" && !window.location.hash) {
        scrollFrameRef.current = window.requestAnimationFrame(() => {
          scrollFrameRef.current = null
          window.scrollTo({ top: 0, left: 0, behavior: "auto" })
        })
      }

      return () => {
        if (scrollFrameRef.current !== null) {
          window.cancelAnimationFrame(scrollFrameRef.current)
          scrollFrameRef.current = null
        }
      }
    }

    updateState(openReaderTopic(stateRef.current, activeTopicId))
    scheduleSave()

    let cancelRestoration: (() => void) | null = null
    if (navigation !== "history" && !window.location.hash) {
      const top =
        navigation === "top" ? 0 : (stateRef.current.topics[activeTopicId]?.scrollPosition ?? 0)
      if (top > 0 && navigation !== "top") {
        cancelRestoration = restoreReaderScroll(top)
      } else {
        scrollFrameRef.current = window.requestAnimationFrame(() => {
          scrollFrameRef.current = null
          window.scrollTo({ top: 0, left: 0, behavior: "auto" })
        })
      }
    }

    return () => {
      cancelRestoration?.()
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current)
        scrollFrameRef.current = null
      }
      flush()
    }
  }, [activeTopicId, flush, routePath, scheduleSave, updateState])

  useEffect(() => {
    if (!activeTopicId) return

    /** Limit measurement and React updates to one per animation frame. */
    const handleScroll = () => {
      if (activeTopicIdRef.current !== activeTopicId) return
      if (scrollFrameRef.current !== null) return
      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null
        if (activeTopicIdRef.current !== activeTopicId) return
        capturePosition(activeTopicId)
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeTopicId, capturePosition])

  useEffect(() => {
    /** Flush pending progress when the document is suspended or discarded. */
    const handlePageHide = () => {
      if (activeTopicId) capturePosition(activeTopicId)
      flush()
    }

    window.addEventListener("pagehide", handlePageHide)
    return () => window.removeEventListener("pagehide", handlePageHide)
  }, [activeTopicId, capturePosition, flush])

  useEffect(
    () => () => {
      flush()
    },
    [flush],
  )

  return {
    state,
    resumePath: getReaderResumePath(manual, state),
  }
}

interface ReaderProgress {
  /** Current reader state, updated automatically while reading */
  state: ReaderState
  /** Current route for resuming the most recently opened valid topic */
  resumePath: string | null
}

type NavigationKind = NavigationScrollMode | "history" | "initial"
