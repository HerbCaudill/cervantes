import { describe, expect, it } from "vitest"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual } from "@/manual/types"
import task5ContentGolden from "./fixtures/task5-content-golden.json"
import { getManualContentDigest } from "./getManualContentDigest"

const manual = manualDraft as Manual
const task = manual.sections.find(section => section.id === "task-5")
const topics = task?.topics ?? []
const blocks = topics.flatMap(topic => topic.blocks)

function getNormalizedVisibleText(value: unknown): string {
  const visibleStrings: string[] = []
  const metadataKeys = new Set(["assetId", "id", "kind", "src", "style", "type", "variant"])

  function collect(current: unknown, key?: string): void {
    if (key && metadataKeys.has(key)) return
    if (typeof current === "string") {
      visibleStrings.push(current)
      return
    }
    if (Array.isArray(current)) {
      current.forEach(item => collect(item))
      return
    }
    if (current && typeof current === "object") {
      Object.entries(current).forEach(([entryKey, entryValue]) => collect(entryValue, entryKey))
    }
  }

  collect(value)
  return visibleStrings
    .join(" ")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}%]+/gu, " ")
    .trim()
}

describe("verified Task 5 manual content", () => {
  it("matches the complete ordered source-audited content golden", async () => {
    const canonical = JSON.stringify(task)
    const normalizedVisibleText = getNormalizedVisibleText(task)
    const tables = blocks.filter(block => block.type === "table")

    expect({
      blockCount: blocks.length,
      canonicalBytes: new TextEncoder().encode(canonical).length,
      canonicalCharacters: canonical.length,
      contentNormalizedCharacters: normalizedVisibleText.length,
      contentTokenCount: normalizedVisibleText.split(" ").length,
      tableCellCount: tables.reduce(
        (total, table) =>
          total +
          (table.type === "table" ? table.rows.reduce((sum, row) => sum + row.length, 0) : 0),
        0,
      ),
      tableRowCount: tables.reduce(
        (total, table) => total + (table.type === "table" ? table.rows.length : 0),
        0,
      ),
      taskSha256: await getManualContentDigest(task),
      topicCount: topics.length,
    }).toEqual({
      blockCount: task5ContentGolden.blockCount,
      canonicalBytes: task5ContentGolden.canonicalBytes,
      canonicalCharacters: task5ContentGolden.canonicalCharacters,
      contentNormalizedCharacters: task5ContentGolden.sourceAudit.contentNormalizedCharacters,
      contentTokenCount: task5ContentGolden.sourceAudit.contentTokenCount,
      tableCellCount: task5ContentGolden.tableCellCount,
      tableRowCount: task5ContentGolden.tableRowCount,
      taskSha256: task5ContentGolden.taskSha256,
      topicCount: task5ContentGolden.topicCount,
    })
  })

  it("changes the golden digest for representative nested content and order mutations", async () => {
    if (!task) throw new Error("Task 5 is missing")

    const mutations = [
      (mutatedTask: typeof task) => {
        mutatedTask.topics.reverse()
      },
      (mutatedTask: typeof task) => {
        mutatedTask.topics[0].blocks.reverse()
      },
      (mutatedTask: typeof task) => {
        const list = mutatedTask.topics
          .flatMap(topic => topic.blocks)
          .find(block => block.type === "list")
        if (!list) throw new Error("Task 5 list is missing")
        list.items[0] = "unexpected list item"
      },
      (mutatedTask: typeof task) => {
        const table = mutatedTask.topics
          .flatMap(topic => topic.blocks)
          .find(block => block.type === "table")
        if (!table) throw new Error("Task 5 table is missing")
        table.rows[0][0].text = null
      },
      (mutatedTask: typeof task) => {
        const figure = mutatedTask.topics
          .flatMap(topic => topic.blocks)
          .find(block => block.type === "figure")
        if (!figure) throw new Error("Task 5 figure is missing")
        figure.assetId = "unexpected-asset"
        figure.caption = "unexpected caption"
      },
    ]

    const mutatedDigests = await Promise.all(
      mutations.map(async mutate => {
        const mutatedTask = structuredClone(task)
        mutate(mutatedTask)
        return getManualContentDigest(mutatedTask)
      }),
    )

    expect(mutatedDigests).not.toContain(task5ContentGolden.taskSha256)
    expect(new Set(mutatedDigests)).toHaveLength(mutations.length)
  })

  it("reconstructs the source around its semantic headings", () => {
    expect(topics.map(topic => [topic.id, topic.title])).toEqual([
      [
        "task-5-identificacion-personal-y-tramites-administrativos",
        "Identificación personal y trámites administrativos",
      ],
      ["task-5-guia-de-la-vida-diaria", "Guía de la vida diaria"],
      ["task-5-animales-domesticos", "Animales domésticos"],
      ["task-5-comidas-y-bebidas", "Comidas y bebidas"],
      ["task-5-calendario-dias-festivos-y-horarios", "Calendario: días festivos y horarios"],
      ["task-5-educacion", "Educación"],
      ["task-5-salud", "Salud"],
      ["task-5-servicios-sociales-y-programas-de-ayuda", "Servicios sociales y programas de ayuda"],
      ["task-5-medios-de-comunicacion-e-informacion", "Medios de comunicación e información"],
      ["task-5-unidades-de-medida", "Unidades de medida"],
      ["task-5-horarios-comerciales", "Horarios comerciales"],
      ["task-5-normativa-de-comercio", "Normativa de comercio"],
      ["task-5-servicios-y-espacios-publicos", "Servicios y espacios públicos"],
      [
        "task-5-transporte-urbano-e-interurbano-en-espana",
        "Transporte urbano e interurbano en España",
      ],
      ["task-5-economia-y-trabajo", "Economía y trabajo"],
      ["task-5-caracteristicas-de-la-economia-espanola", "Características de la economía española"],
    ])
  })

  it("joins prose, lists, and tables split across source pages without extraction fragments", () => {
    const paragraphs = blocks.flatMap(block => (block.type === "paragraph" ? [block.text] : []))
    const lists = blocks.filter(block => block.type === "list")
    const serialized = JSON.stringify(task)

    expect(paragraphs).toContain(
      "En España, alrededor del 75 % de las viviendas son en propiedad (un 30 % de ellas con hipoteca), mientras que cerca del 25 % se alquilan. El alquiler se regula mediante un contrato en el que se fijan datos básicos como la duración, el precio y las obligaciones de arrendador e inquilino, con un mínimo legal de cinco años si el propietario es persona física (siete si es jurídica). Al firmar, el arrendatario debe entregar una fianza, equivalente, en la mayoría de los casos, a una mensualidad, que el propietario ha de depositar en el organismo autonómico y que sirve para cubrir posibles impagos o desperfectos. Esta fianza se devolverá al finalizar el contrato si no hay incidencias.",
    )
    expect(paragraphs).toContain(
      "El sistema legal de unidades de medida es el Sistema Internacional de Unidades (SI) de la Conferencia General de Pesas y Medidas (CGPM) existente en la Unión Europea.",
    )
    expect(
      lists.find(
        list =>
          list.type === "list" &&
          typeof list.items[0] === "string" &&
          list.items[0].startsWith("ocupadas"),
      )?.items,
    ).toHaveLength(4)
    expect(serialized).not.toMatch(
      /draft-page|labora l|certicado|Ayudasscales|protección ocial|Escuelas Ociales|Canales privado s/,
    )
  })

  it("keeps the four one-year nationality cases nested under their source parent", () => {
    const oneYearCases = blocks.find(
      block =>
        block.type === "list" &&
        JSON.stringify(block).includes("1 año: en casos especiales, por ejemplo:"),
    )

    expect(oneYearCases).toMatchObject({
      type: "list",
      style: "unordered",
      items: [
        {
          text: "1 año: en casos especiales, por ejemplo:",
          children: {
            type: "list",
            style: "unmarked",
            items: [
              "a. Nacido en España.",
              "b. Casado con un ciudadano español.",
              "c. Viudo de un ciudadano español (si no había separación).",
              "d. Haber residido bajo tutela o acogimiento de un ciudadano español.",
            ],
          },
        },
      ],
    })
  })

  it("preserves all four source tables including the two-page education table", () => {
    const tables = blocks.filter(block => block.type === "table")

    expect(tables.map(table => table.caption)).toEqual([
      "TABLA 8. Sistema educativo español",
      "TABLA 9. Principales magnitudes de medidas del SI",
      "TABLA 10. Unidades que no pertenecen al SI cuyo uso es aceptado por el Sistema y que están autorizadas",
      "TABLA 11. Expresiones de medidas habituales",
    ])
    expect(tables[0]?.rows).toHaveLength(7)
    expect(tables[0]?.rows[0].map(cell => cell.text)).toEqual([
      "Educación Infantil",
      "No es obligatoria Se divide en dos ciclos, el primero de 0 a 3 años y el segundo de 3 a 6 años; este último no es obligatorio pero sí es gratuito.",
      null,
    ])
    expect(tables[0]?.rows.at(-1)?.[0].text).toBe(
      "Enseñanzas de régimen especial: Enseñanzas artísticas, deportivas y de idiomas.",
    )
    expect(tables[2]?.rows.map(row => row.map(cell => cell.text))).toEqual([
      ["Tiempo", "minuto", "min", "1 min = 60 s"],
      [null, "hora", "h", "1 h = 60 min"],
      [null, "día", "d", "1 d = 24 h"],
      ["Área", "hectárea", "ha", "1 ha = 10 000 m²"],
      ["Volumen", "litro", "l", "1 l = 1 dm³"],
      ["Masa", "tonelada", "t", "1 t = 1000 kg"],
    ])
  })

  it("keeps every numbered figure in source order with exact source captions", () => {
    const figures = blocks.flatMap(block => {
      if (block.type === "figure") return [[block.assetId, block.caption]]
      if (block.type !== "table") return []
      return block.rows.flatMap(row =>
        row.flatMap(cell => cell.figures?.map(figure => [figure.assetId, figure.caption]) ?? []),
      )
    })

    expect(figures).toHaveLength(33)
    expect(figures[0]).toEqual([
      "figure-70-68",
      "FIGURA 68. Nuevo documento de identidad español (anverso). © Gobierno de España",
    ])
    expect(figures).toContainEqual([
      "figure-88-90",
      "FIGURA90 AVE son los trenes de alta velocidad de Renfe. © Mikel Ortega",
    ])
    expect(figures).toContainEqual(["figure-72-family", "© Unsplash"])
    expect(figures).toContainEqual(["figure-82-emergency-112", "112"])
    expect(figures.at(-1)).toEqual([
      "figure-90-96",
      "FIGURA 96. Vista de la sede central del Banco de España, Madrid. © Luis García",
    ])
  })

  it("retains useful local metadata for standalone source visuals", () => {
    expect(
      manual.assets
        .filter(asset => asset.id === "figure-72-family" || asset.id === "figure-82-emergency-112")
        .map(asset => [asset.id, asset.src, asset.alt]),
    ).toEqual([
      [
        "figure-72-family",
        "/manual/figures/figure-72-family.jpg",
        "Un adulto lleva a un bebé en una mochila portabebés",
      ],
      [
        "figure-82-emergency-112",
        "/manual/figures/figure-82-emergency-112.jpg",
        "Número europeo de emergencias 112 rodeado por estrellas de la Unión Europea",
      ],
    ])
  })

  it("preserves apparent source errors verbatim", () => {
    expect(JSON.stringify(task)).toContain(
      "Tarjeta sanitaria de Cataluña, es un documentos necesario",
    )
  })
})
