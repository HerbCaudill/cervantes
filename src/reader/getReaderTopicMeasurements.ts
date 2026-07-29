import { getManualTopicSlug } from "@/manual/getManualTopicSlug"
import type { ManualSection } from "@/manual/types"

/** Measure visible reading progress for every topic in one continuous tarea. */
export function getReaderTopicMeasurements(
  /** Tarea currently rendered */
  section: ManualSection,
): ReaderTopicMeasurements {
  const viewportEnd = window.scrollY + window.innerHeight
  const measurements = section.topics.flatMap(topic => {
    const element = document.querySelector<HTMLElement>(`[data-reader-topic="${topic.id}"]`)
    if (!element) return []

    const bounds = element.getBoundingClientRect()
    const top = bounds.top + window.scrollY
    const height = Math.max(0, bounds.height)
    if (height === 0) return []

    return [
      {
        topicId: topic.id,
        scrollPosition: window.scrollY,
        progress: Math.min(1, Math.max(0, (viewportEnd - top) / height)),
      },
    ]
  })
  const activeMeasurement = measurements.findLast(measurement => measurement.progress > 0)

  if (activeMeasurement) {
    return {
      activeTopicId: activeMeasurement.topicId,
      measurements,
    }
  }

  const hash = decodeURIComponent(window.location.hash.slice(1))
  const hashTopic = section.topics.find(topic => getManualTopicSlug(section, topic) === hash)
  const fallbackTopic = hashTopic ?? section.topics[0]
  if (!fallbackTopic) return { activeTopicId: null, measurements: [] }

  const maximumScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  return {
    activeTopicId: fallbackTopic.id,
    measurements: [
      {
        topicId: fallbackTopic.id,
        scrollPosition: window.scrollY,
        progress: maximumScroll === 0 ? 1 : Math.min(1, window.scrollY / maximumScroll),
      },
    ],
  }
}

interface ReaderTopicMeasurement {
  /** Stable semantic topic ID */
  topicId: string
  /** Current tarea document offset */
  scrollPosition: number
  /** Fraction of this topic that has entered the viewport */
  progress: number
}

interface ReaderTopicMeasurements {
  /** Last topic reached by the viewport */
  activeTopicId: string | null
  /** Measurements for rendered topics with usable geometry */
  measurements: ReaderTopicMeasurement[]
}
