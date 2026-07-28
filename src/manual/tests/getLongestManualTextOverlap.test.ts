import { describe, expect, it, vi } from "vitest"
import { createManualBodyTextIndex } from "@/manual/createManualBodyTextIndex"
import { getLongestManualTextOverlap } from "@/manual/getLongestManualTextOverlap"

describe("manual text overlap index", () => {
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
    const has = vi.spyOn(bodyTextIndex.windows, "has")

    const overlap = getLongestManualTextOverlap(calloutText, bodyTextIndex)

    expect(overlap).toEqual({
      start: calloutText.indexOf(sharedText) - 1,
      length: sharedText.length + 2,
    })
    expect(has).toHaveBeenCalledTimes(calloutText.length - minimumLength + 1)
  })
})
