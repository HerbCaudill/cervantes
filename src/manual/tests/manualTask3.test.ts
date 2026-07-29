import { describe, expect, it } from "vitest"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual, ManualBlock } from "@/manual/types"
import task3ContentGolden from "./fixtures/task3-content-golden.json"
import { getManualContentDigest } from "./getManualContentDigest"

const manual = manualDraft as Manual
const task = manual.sections.find(section => section.id === "task-3")
const topics = task?.topics ?? []
const blocks = topics.flatMap(topic => topic.blocks)

describe("verified Task 3 manual content", () => {
  it("matches the complete ordered source-audited content golden", async () => {
    const canonical = JSON.stringify(task)
    const table = blocks.find(block => block.type === "table")

    expect({
      blockCount: blocks.length,
      canonicalBytes: new TextEncoder().encode(canonical).length,
      canonicalCharacters: canonical.length,
      tableCellCount: table?.rows.reduce((total, row) => total + row.length, 0) ?? 0,
      tableRowCount: table?.rows.length ?? 0,
      taskSha256: await getManualContentDigest(task),
      topicCount: topics.length,
    }).toEqual({
      blockCount: task3ContentGolden.blockCount,
      canonicalBytes: task3ContentGolden.canonicalBytes,
      canonicalCharacters: task3ContentGolden.canonicalCharacters,
      tableCellCount: task3ContentGolden.tableCellCount,
      tableRowCount: task3ContentGolden.tableRowCount,
      taskSha256: task3ContentGolden.taskSha256,
      topicCount: task3ContentGolden.topicCount,
    })
  })

  it("changes the golden digest when a nested null table cell changes", async () => {
    if (!task) throw new Error("Task 3 is missing")
    const mutatedTask = structuredClone(task)
    const table = mutatedTask.topics
      .flatMap(topic => topic.blocks)
      .find(block => block.type === "table")
    if (!table) throw new Error("Task 3 table is missing")

    table.rows[1][0].text = "unexpected value"

    expect(await getManualContentDigest(mutatedTask)).not.toBe(task3ContentGolden.taskSha256)
  })

  it("keeps all maps, figures, and the table with their source topics", () => {
    const contentByTopic = new Map(
      topics.map(topic => [
        topic.id,
        topic.blocks.map(block => {
          if (block.type === "figure") return block.assetId
          if (block.type === "table") return block.caption ?? "table"
          return block.type
        }),
      ]),
    )

    expect(contentByTopic.get("task-3-geografia-fisica-y-politica")).toContain("figure-37-14")
    expect(
      contentByTopic
        .get("task-3-accidentes-geograficos-mas-importantes-de-espana")
        ?.filter(value => value.startsWith("figure-")),
    ).toEqual(["figure-38-15", "figure-38-17", "figure-38-16", "figure-39-18"])
    expect(
      contentByTopic.get("task-3-el-clima")?.filter(value => value.startsWith("figure-")),
    ).toEqual(["figure-39-19", "figure-40-20"])
    expect(
      contentByTopic
        .get("task-3-division-territorial-de-espana")
        ?.filter(value => value.startsWith("figure-")),
    ).toEqual([
      "figure-40-21",
      "figure-40-22",
      "figure-41-23",
      "figure-41-24",
      "figure-41-25",
      "figure-42-26",
      "figure-42-27",
      "figure-42-28",
    ])
    expect(contentByTopic.get("task-3-division-territorial-de-espana")).toContain(
      "TABLA 4 Comunidades autónomas, provincias, capitales de provincia y capitales de comunidades autónomas",
    )
  })

  it("reconstructs the complete two-page geographic table and its footnote", () => {
    const division = topics.find(topic => topic.id === "task-3-division-territorial-de-espana")
    const tables = division?.blocks.filter(block => block.type === "table") ?? []
    const table = tables[0]
    const paragraphs = division ? getText(division.blocks, "paragraph") : []

    expect(tables).toHaveLength(1)
    expect(table?.headers).toEqual([
      "Comunidades autónomas",
      "Provincias",
      "Capital de provincia",
      "Capital de la comunidad autónoma",
    ])
    expect(table?.rows).toHaveLength(52)
    expect(
      table?.rows.filter(row => row[0].text !== null).map(row => row.map(cell => cell.text)),
    ).toEqual([
      ["Andalucía", "Almería", "Almería", "Sevilla"],
      ["Aragón", "Huesca", "Huesca", "Zaragoza"],
      ["Principado de Asturias", "Asturias", "Oviedo", "Oviedo"],
      ["Islas Baleares", "Baleares", "Palma de Mallorca", "Palma de Mallorca"],
      [
        "Canarias",
        "Las Palmas",
        "Las Palmas de Gran Canaria",
        "Capitalidad compartida entre Las Palmas de Gran Canaria y Santa Cruz de Tenerife",
      ],
      ["Cantabria", "Cantabria", "Santander", "Santander"],
      ["Castilla-La Mancha", "Albacete", "Albacete", "Toledo"],
      [
        "Castilla y León",
        "Ávila",
        "Ávila",
        "No hay una capital oficial. La sede de las administraciones está en Valladolid¹",
      ],
      ["Cataluña", "Barcelona", "Barcelona", "Barcelona"],
      ["Comunidad Valenciana", "Alicante", "Alicante", "Valencia"],
      ["Extremadura", "Badajoz", "Badajoz", "Mérida"],
      ["Galicia", "La Coruña", "La Coruña", "Santiago de Compostela"],
      ["La Rioja", "La Rioja", "Logroño", "Logroño"],
      ["Comunidad de Madrid", "Madrid", "Madrid", "Madrid"],
      ["Región de Murcia", "Murcia", "Murcia", "Murcia"],
      ["Comunidad Foral de Navarra", "Navarra", "Pamplona", "Pamplona"],
      ["País Vasco", "Álava", "Vitoria", "No declarada. Sede de las administraciones: Vitoria"],
      ["Ciudades autónomas", "Ceuta", null, null],
    ])
    expect(table?.rows.map(row => row.map(cell => cell.text))).toContainEqual([
      null,
      "Valladolid",
      "VallaVdolid",
      null,
    ])
    expect(table?.rows.map(row => row.map(cell => cell.text))).toContainEqual([
      null,
      "Melilla",
      null,
      null,
    ])
    expect(paragraphs).toContain(
      "1 En el Estatuto de Autonomía no se establece una capitalidad, pero la Junta de Castilla y León y las Cortes tienen su sede en Valladolid.",
    )
    expect(JSON.stringify(table?.rows)).not.toContain("1 1 En el Estatuto")
  })

  it("preserves source typography and apparent source errors without extraction artifacts", () => {
    const serialized = JSON.stringify(task)
    const paragraphs = getText(blocks, "paragraph")

    expect(paragraphs).toContain(
      "España está situada en el sur de Europa y tiene frontera con Andorra, Francia, Portugal y Marruecos. Es el cuarto país más grande del continente, con una extensión de 505 944 km². Es uno de los países más montañosos de Europa, con una altitud media de 650 metros sobre el nivel del mar. La cifra oficial de habitantes es de 49 315 949 a 1 de julio de 2025.",
    )
    expect(paragraphs).toContain(
      "Los parques nacionales de España son, en la actualidad: Islas Atlánticas de Galicia, Picos de Europa (Asturias, Castilla y León y Cantabria), Ordesa y Monte Perdido (Aragón), Aigüestortes y Estany de Sant Maurici (Cataluña), Monfragüe (Extremadura), Sierra de Guadarrama (Madrid), Cabañeros y Tablas de Daimiel (Castilla-La Mancha), Doñana, Sierra Nevada y Sierra de la Nieves (Andalucía), Archipiélago de Cabrera (Islas Baleares) y Caldera de Taburiente, Teide, Timanfaya y Garajonay (Canarias).",
    )
    expect(serialized).not.toMatch(/draft-page|km 2|Castilla- La Mancha/)
  })
})

/** Get text from blocks of one semantic type. */
function getText(
  /** Blocks to inspect */
  sourceBlocks: readonly ManualBlock[],
  /** Text-bearing block type */
  type: "paragraph",
): string[] {
  return sourceBlocks.flatMap(block => (block.type === type ? [block.text] : []))
}
