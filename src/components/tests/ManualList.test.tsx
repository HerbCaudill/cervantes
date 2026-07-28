import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ManualList } from "@/components/ManualList"

describe("ManualList", () => {
  it("derives the marginal note from recursively nested item text", () => {
    render(
      <ManualList
        block={{
          type: "list",
          style: "unordered",
          items: [
            {
              text: "Casos especiales:",
              children: {
                type: "list",
                style: "unmarked",
                items: ["Normativa vigente desde 2020."],
              },
            },
          ],
        }}
      />,
    )

    expect(document.querySelector("[data-margin-note='2020']")).toHaveTextContent("2020")
  })

  it("keeps existing string items as peer rows without nested lists", () => {
    render(
      <ManualList
        block={{
          type: "list",
          style: "unordered",
          items: ["Primer elemento", "Segundo elemento"],
        }}
      />,
    )

    const list = screen.getByRole("list")
    expect(
      within(list)
        .getAllByRole("listitem")
        .map(item => item.textContent),
    ).toEqual(["Primer elemento", "Segundo elemento"])
    expect(within(list).queryByRole("list")).not.toBeInTheDocument()
  })
})
