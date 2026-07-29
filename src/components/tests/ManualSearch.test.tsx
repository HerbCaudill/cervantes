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
    expect(firstResult).toHaveAttribute("href", expect.stringMatching(/^\/manual\/task-\d#/))
    expect(
      within(results).getAllByText(/constitución/i, { selector: "mark" }).length,
    ).toBeGreaterThan(0)
    expect(screen.queryByRole("heading", { name: "Buscar en el manual" })).not.toBeInTheDocument()
    expect(screen.queryByText("Limpiar búsqueda")).not.toBeInTheDocument()
  })

  it("submits and clears routed queries from the header", async () => {
    render(<App />)
    const input = screen.getByRole("searchbox", { name: "Buscar en el manual" })
    const searchButton = screen.getByRole("button", { name: "Buscar" })

    fireEvent.change(input, { target: { value: "constitución española" } })
    fireEvent.click(searchButton)

    expect(window.location.pathname).toBe("/manual/buscar")
    expect(window.location.search).toBe("?q=constituci%C3%B3n+espa%C3%B1ola")
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/\d+ resultados?/))

    fireEvent.change(input, { target: { value: "" } })
    fireEvent.click(searchButton)

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

  it("leaves index navigation to the primary Manual tab", () => {
    render(<App />)

    expect(screen.queryByRole("link", { name: "← Índice del manual" })).not.toBeInTheDocument()
    expect(screen.queryByText("Busca palabras o frases en todo el manual.")).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /^Manual$/ })).toHaveAttribute("href", "/manual")
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
