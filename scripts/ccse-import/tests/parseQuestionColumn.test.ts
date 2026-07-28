import { describe, expect, it } from "vitest"
import { parseQuestionColumn } from "../parseQuestionColumn.ts"
import type { QuestionSection } from "../types.ts"

describe("parseQuestionColumn", () => {
  it("treats a year at the start of a wrapped line as prompt text", () => {
    const section: QuestionSection = {
      section: "constitution-government",
      type: "multiple-choice",
      firstPage: 18,
      lastPage: 26,
      firstId: 1001,
      lastId: 1120,
    }
    const lines = [
      { text: "1076 El Ejército español participa desde", x: 34 },
      { text: "1989 en misiones de paz de la…", x: 79 },
      { text: "a. Organización de Estados", x: 78 },
      { text: "Iberoamericanos (OEI).", x: 96 },
      { text: "b. Unión Europea Occidental (UEO).", x: 78 },
      { text: "c. Organización de las Naciones", x: 78 },
      { text: "Unidas (ONU).", x: 96 },
    ]

    expect(parseQuestionColumn(lines, section)).toEqual([
      {
        id: "1076",
        section: "constitution-government",
        type: "multiple-choice",
        prompt: "El Ejército español participa desde 1989 en misiones de paz de la…",
        options: [
          "Organización de Estados Iberoamericanos (OEI).",
          "Unión Europea Occidental (UEO).",
          "Organización de las Naciones Unidas (ONU).",
        ],
      },
    ])
  })

  it.each([
    {
      name: "a missing label",
      lines: [
        { text: "1001 Prompt", x: 34 },
        { text: "a. First", x: 78 },
        { text: "b. Second", x: 78 },
      ],
      error: "has 2 option labels",
    },
    {
      name: "a duplicate label",
      lines: [
        { text: "1001 Prompt", x: 34 },
        { text: "a. First", x: 78 },
        { text: "a. Duplicate", x: 78 },
      ],
      error: "has option a; expected b",
    },
    {
      name: "an out-of-order label",
      lines: [
        { text: "1001 Prompt", x: 34 },
        { text: "a. First", x: 78 },
        { text: "c. Third", x: 78 },
      ],
      error: "has option c; expected b",
    },
    {
      name: "junk after the final option",
      lines: [
        { text: "1001 Prompt", x: 34 },
        { text: "a. First", x: 78 },
        { text: "b. Second", x: 78 },
        { text: "c. Third", x: 78 },
        { text: "Unexpected footer", x: 78 },
      ],
      error: "Unexpected text after an option",
    },
  ])("rejects $name", ({ lines, error }) => {
    const section: QuestionSection = {
      section: "constitution-government",
      type: "multiple-choice",
      firstPage: 18,
      lastPage: 26,
      firstId: 1001,
      lastId: 1120,
    }

    expect(() => parseQuestionColumn(lines, section)).toThrow(error)
  })

  it("rejects junk after the final true/false option", () => {
    const section: QuestionSection = {
      section: "rights-participation",
      type: "true-false",
      firstPage: 33,
      lastPage: 35,
      firstId: 2001,
      lastId: 2036,
    }
    const lines = [
      { text: "2001 Prompt", x: 304 },
      { text: "a. Verdadero.", x: 349 },
      { text: "b. Falso.", x: 349 },
      { text: "Unexpected footer", x: 349 },
    ]

    expect(() => parseQuestionColumn(lines, section)).toThrow("Unexpected text after an option")
  })
})
