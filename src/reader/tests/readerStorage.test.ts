import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { STORAGE_KEY } from "@/constants"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual } from "@/manual/types"
import { READER_STATE_STORAGE_KEY, READER_STATE_VERSION } from "@/reader/constants"
import { loadReaderState } from "@/reader/loadReaderState"
import { saveReaderState } from "@/reader/saveReaderState"
import type { ReaderState } from "@/reader/types"

const manual = manualDraft as Manual

describe("reader storage", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("uses a versioned key independent from flashcard review history", () => {
    expect(READER_STATE_STORAGE_KEY).toMatch(/v1/)
    expect(READER_STATE_STORAGE_KEY).not.toBe(STORAGE_KEY)

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ question: { repetitions: 3 } }))
    const state: ReaderState = {
      version: READER_STATE_VERSION,
      lastTopicId: manual.sections[0].topics[0].id,
      topics: {},
    }

    saveReaderState(state)

    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ question: { repetitions: 3 } }))
    expect(loadReaderState(manual)).toEqual(state)
  })

  it("fails safely when storage contains corrupt reader state", () => {
    localStorage.setItem(READER_STATE_STORAGE_KEY, "{")

    expect(loadReaderState(manual)).toEqual({
      version: READER_STATE_VERSION,
      lastTopicId: null,
      topics: {},
    })
  })

  it("starts empty when browser privacy settings block storage reads", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage access denied", "SecurityError")
    })

    expect(loadReaderState(manual)).toEqual({
      version: READER_STATE_VERSION,
      lastTopicId: null,
      topics: {},
    })
  })

  it("keeps reading available when browser privacy settings block storage writes", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage access denied", "SecurityError")
    })
    const state: ReaderState = {
      version: READER_STATE_VERSION,
      lastTopicId: manual.sections[0].topics[0].id,
      topics: {},
    }

    expect(() => saveReaderState(state)).not.toThrow()
  })
})
