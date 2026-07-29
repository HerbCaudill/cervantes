import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ManualList } from "@/components/ManualList"

describe("ManualList", () => {
  it("renders recursively nested item text without a derived marginal note", () => {
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

    expect(screen.getByText("Normativa vigente desde 2020.")).toBeVisible()
    expect(document.querySelector("[data-margin-note]")).not.toBeInTheDocument()
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
