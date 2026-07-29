import { fireEvent, render, screen, within } from "@testing-library/react"
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
  it("expands every tarea and shows every topic link initially", () => {
    render(<ManualIndex manual={manual} readerState={emptyReaderState} resumePath={null} />)

    const index = screen.getByRole("navigation", { name: "Índice completo del manual" })
    const tareas = index.querySelectorAll("details")
    const expectedLinkCount = manual.sections.reduce(
      (count, section) => count + section.topics.length + 1,
      0,
    )

    expect(tareas).toHaveLength(manual.sections.length)
    tareas.forEach(tarea => expect(tarea).toHaveAttribute("open"))
    expect(within(index).getAllByRole("link")).toHaveLength(expectedLinkCount)
  })

  it("lets readers collapse and reopen a tarea", () => {
    render(<ManualIndex manual={manual} readerState={emptyReaderState} resumePath={null} />)

    const summary = screen.getByText(manual.sections[1].title)
    const tarea = summary.closest("details")

    expect(tarea).toHaveAttribute("open")
    fireEvent.click(summary)
    expect(tarea).not.toHaveAttribute("open")
    fireEvent.click(summary)
    expect(tarea).toHaveAttribute("open")
  })
})
