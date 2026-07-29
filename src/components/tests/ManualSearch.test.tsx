import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { App } from "@/App"
import { ManualSearchHighlight } from "@/components/ManualSearchHighlight"

describe("manual search screen", () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState(null, "", "/manual/buscar")
  })

  it("restores a routed query and returns highlighted semantic topic links", async () => {
    window.history.replaceState(null, "", "/manual/buscar?q=CONSTITUCION+ESPANOLA")
    render(<App />)

    expect(screen.getByRole("searchbox", { name: "Buscar en el manual" })).toHaveValue(
      "CONSTITUCION ESPANOLA",
    )
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/\d+ resultados?/))
    const results = screen.getByRole("list", { name: "Resultados de búsqueda" })
    const firstResult = within(results).getAllByRole("link")[0]
    expect(firstResult).toHaveAttribute("href", expect.stringMatching(/^\/manual\/task-\d\//))
    expect(
      within(results).getAllByText(/constitución/i, { selector: "mark" }).length,
    ).toBeGreaterThan(0)
  })

  it("submits and clears queries through browser history", async () => {
    render(<App />)
    const input = screen.getByRole("searchbox", { name: "Buscar en el manual" })

    fireEvent.change(input, { target: { value: "constitución española" } })
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }))

    expect(window.location.pathname).toBe("/manual/buscar")
    expect(window.location.search).toBe("?q=constituci%C3%B3n+espa%C3%B1ola")
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/\d+ resultados?/))

    fireEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }))

    expect(window.location.search).toBe("")
    expect(input).toHaveValue("")
    expect(screen.queryByRole("list", { name: "Resultados de búsqueda" })).not.toBeInTheDocument()

    await act(() => {
      window.history.back()
      return new Promise(resolve => window.setTimeout(resolve, 0))
    })

    await waitFor(() => expect(input).toHaveValue("constitución española"))
    expect(screen.getByRole("status")).toHaveTextContent(/\d+ resultados?/)
  })

  it("announces an unmatched query without rendering a result list", async () => {
    window.history.replaceState(null, "", "/manual/buscar?q=zzzinexistente")
    render(<App />)

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "No hay resultados para «zzzinexistente».",
      ),
    )
    expect(screen.queryByRole("list", { name: "Resultados de búsqueda" })).not.toBeInTheDocument()
  })

  it("renders highlighted source text without interpreting markup", () => {
    const { container } = render(
      <ManualSearchHighlight
        text={'Texto <img src="x" onerror="alert(1)"> seguro'}
        query="img alert"
      />,
    )

    expect(container.querySelector("img")).toBeNull()
    expect(screen.getByText("img", { selector: "mark" })).toBeInTheDocument()
    expect(screen.getByText("alert", { selector: "mark" })).toBeInTheDocument()
  })
})
