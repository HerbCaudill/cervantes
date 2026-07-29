import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ManualIndex } from "@/components/ManualIndex"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual } from "@/manual/types"
import { READER_STATE_VERSION } from "@/reader/constants"
import type { ReaderState } from "@/reader/types"

const manual = manualDraft as Manual
const emptyReaderState: ReaderState = {
  version: READER_STATE_VERSION,
  lastTopicId: null,
  topics: {},
}

describe("manual index", () => {
  it("shows every tarea and topic link without disclosure controls", () => {
    render(<ManualIndex manual={manual} readerState={emptyReaderState} />)

    const index = screen.getByRole("navigation", { name: "Índice completo del manual" })
    const expectedLinkCount = manual.sections.reduce(
      (count, section) => count + section.topics.length + 1,
      0,
    )
    const topicLinks = within(index)
      .getAllByRole("link")
      .filter(link => link.getAttribute("href")?.includes("#"))

    expect(index.querySelector("details")).not.toBeInTheDocument()
    expect(within(index).queryByRole("group")).not.toBeInTheDocument()
    expect(within(index).getAllByRole("link")).toHaveLength(expectedLinkCount)
    expect(topicLinks).toHaveLength(
      manual.sections.reduce((count, section) => count + section.topics.length, 0),
    )
    expect(
      within(index).queryByRole("link", { name: /Índice de la Tarea/i }),
    ).not.toBeInTheDocument()
    for (const link of topicLinks) {
      expect(link.getAttribute("href")).toMatch(/^\/manual\/task-\d#[a-z0-9-]+$/)
    }
  })

  it("links each tarea heading to its continuous page", () => {
    render(<ManualIndex manual={manual} readerState={emptyReaderState} />)

    manual.sections.forEach((section, index) => {
      expect(
        screen.getByRole("link", {
          name: `Tarea ${index + 1}: ${section.title}`,
        }),
      ).toHaveAttribute("href", `/manual/${section.id}`)
    })
  })
})
