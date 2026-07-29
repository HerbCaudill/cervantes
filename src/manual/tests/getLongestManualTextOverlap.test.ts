import { describe, expect, it, vi } from "vitest"
import { createManualBodyTextIndex } from "@/manual/createManualBodyTextIndex"
import { getLongestManualTextOverlap } from "@/manual/getLongestManualTextOverlap"
import { getManualTextWindowHash } from "@/manual/getManualTextWindowHash"

describe("manual text overlap index", () => {
  it("does not stitch adjacent windows from different body segments", () => {
    const windowLength = 64
    const calloutText = `${"a".repeat(32)} ${"b".repeat(32)}`
    const bodyTextIndex = createManualBodyTextIndex(
      [calloutText.slice(0, windowLength), calloutText.slice(1)],
      windowLength,
    )

    expect(getLongestManualTextOverlap(calloutText, bodyTextIndex)).toEqual({
      start: 0,
      length: windowLength,
    })
  })

  it("verifies source text when different windows have the same 32-bit hash", () => {
    const windowLength = 64
    const calloutText = `Aa${"x".repeat(windowLength - 2)}`
    const collidingBodyText = `BB${"x".repeat(windowLength - 2)}`
    const bodyTextIndex = createManualBodyTextIndex([collidingBodyText], windowLength)

    expect(getManualTextWindowHash(calloutText, 0, windowLength)).toBe(
      getManualTextWindowHash(collidingBodyText, 0, windowLength),
    )
    expect(getLongestManualTextOverlap(calloutText, bodyTextIndex)).toBeNull()
  })

  it("does one indexed lookup per callout window without scanning body segments", () => {
    const minimumLength = 64
    const sharedText =
      "las personas interesadas presentan toda la documentación original en el registro provincial"
    const bodySearchSegments = Array.from(
      { length: 923 },
      (_, index) => `segmento ${index} sin coincidencias sustanciales`,
    )
    bodySearchSegments[700] = `Texto anterior ${sharedText} texto posterior`
    const calloutText = `Prefacio único ${sharedText} epílogo único`
    const bodyTextIndex = createManualBodyTextIndex(bodySearchSegments, minimumLength)
    const get = vi.spyOn(bodyTextIndex.occurrencesByHash, "get")

    const overlap = getLongestManualTextOverlap(calloutText, bodyTextIndex)

    expect(overlap).toEqual({
      start: calloutText.indexOf(sharedText) - 1,
      length: sharedText.length + 2,
    })
    expect(get).toHaveBeenCalledTimes(calloutText.length - minimumLength + 1)
  })
})
