import { describe, expect, it } from "vitest"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual } from "@/manual/types"
import { validateManual } from "@/manual/validateManual"

const manual = manualDraft as Manual

describe("manual extraction draft", () => {
  it("matches the reader schema after deterministic extraction", () => {
    expect(() => validateManual(manual)).not.toThrow()
  })

  it("retains every numbered table as structured content", () => {
    const tables = manual.sections.flatMap(section =>
      section.topics.flatMap(topic => topic.blocks.filter(block => block.type === "table")),
    )
    const tableNumbers = tables
      .flatMap(table =>
        table.type === "table" ? [table.caption?.match(/^TABLA\s+(\d+)/)?.[1]] : [],
      )
      .filter(Boolean)

    expect(new Set(tableNumbers)).toEqual(
      new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]),
    )
    expect(
      tables.find(table => table.type === "table" && table.caption?.startsWith("TABLA 2."))?.type,
    ).toBe("table")
    expect(
      tables.find(table => table.type === "table" && table.caption?.startsWith("TABLA 3."))?.type,
    ).toBe("table")
  })

  it("retains every unnumbered artwork as its own referenced asset", () => {
    const expectedTitles = [
      "San Francisco en oración",
      "Las meninas",
      "Los fusilamientos del 3 de mayo",
      "La maja desnuda",
      "Guernica",
      "Paseo a la orilla del mar",
      "Logotipo de Turespaña",
      "La verbena",
      "Figura en una ventana",
      "Madrid desde Capitán Haya",
    ]
    const artworkAssets = manual.assets.filter(asset => asset.id.includes("-artwork-"))
    const referencedAssetIds = new Set(
      manual.sections.flatMap(section =>
        section.topics.flatMap(topic =>
          topic.blocks.flatMap(block =>
            block.type === "figure" && "assetId" in block ? [block.assetId] : [],
          ),
        ),
      ),
    )

    expect(artworkAssets.map(asset => asset.alt.split(" — ")[0])).toEqual(expectedTitles)
    expect(artworkAssets.every(asset => referencedAssetIds.has(asset.id))).toBe(true)
  })

  it("reconstructs Task 1 around the source headings instead of PDF pages", () => {
    const task = manual.sections.find(section => section.id === "task-1")

    expect(task?.topics.map(topic => [topic.id, topic.title])).toEqual([
      [
        "task-1-poderes-del-estado-gobierno-e-instituciones",
        "PODERES DEL ESTADO, GOBIERNO E INSTITUCIONES",
      ],
      [
        "task-1-representacion-en-organismos-internacionales",
        "Representación de España en organismos internacionales",
      ],
      ["task-1-poder-ejecutivo", "Poder Ejecutivo"],
      ["task-1-poder-legislativo", "Poder Legislativo"],
      ["task-1-poder-judicial", "Poder Judicial"],
      ["task-1-religion", "Religión"],
      [
        "task-1-fuerzas-armadas-y-cuerpos-de-seguridad",
        "Las Fuerzas Armadas y las Fuerzas y Cuerpos de Seguridad",
      ],
      ["task-1-organismos-espanoles", "Organismos españoles"],
      [
        "task-1-organizacion-territorial-y-administrativa",
        "Organización territorial y administrativa",
      ],
      ["task-1-comunidades-y-ciudades-autonomas", "Comunidades y ciudades autónomas"],
      ["task-1-provincias", "Provincias"],
      ["task-1-municipios", "Municipios"],
      ["task-1-administracion-electronica", "La Administración Electrónica"],
      ["task-1-poblacion", "Población"],
      ["task-1-participacion-ciudadana", "Participación ciudadana"],
    ])
  })

  it("joins Task 1 prose and lists split across source pages", () => {
    const task = manual.sections.find(section => section.id === "task-1")
    const blocks = task?.topics.flatMap(topic => topic.blocks) ?? []
    const text = blocks.flatMap(block => {
      if (block.type === "paragraph") return [block.text]
      if (block.type === "list") return block.items
      return []
    })

    expect(text).toContain(
      "La bandera de España tiene tres franjas (roja, amarilla y roja). Cada comunidad autónoma tiene su propia bandera y debe utilizarla junto a la española en sus edificios públicos y en sus actos oficiales.",
    )
    expect(text).toContain(
      "Las Fuerzas y Cuerpos de Seguridad tienen como función proteger el libre ejercicio de los derechos y libertades y garantizar la seguridad ciudadana.",
    )
    expect(text).toContain(
      "Las competencias asumidas dentro del marco establecido en la Constitución y las bases para el traspaso de los servicios correspondientes a la comunidad. Entre las más significativas se encuentran la sanidad y la educación.",
    )
    expect(text).toContain(
      "La Constitución establece que la base del sistema político es el derecho al voto de todos los españoles mediante sufragio universal, libre, igual, directo y secreto, en el que son electores y elegibles todos los españoles mayores de 18 años. En las elecciones municipales también se permite el voto de los ciudadanos residentes en España procedentes de la Unión Europea y de algunos países con los que España tiene firmados acuerdos.",
    )
    expect(text).not.toContain(
      "La bandera de España tiene tres franjas (roja, amarilla y roja). Cada comunidad autónoma tiene su propia bandera y debe",
    )
  })

  it("keeps Task 1 tables and figures beside the source topics that introduce them", () => {
    const task = manual.sections.find(section => section.id === "task-1")
    const topicBlocks = new Map(
      task?.topics.map(topic => [
        topic.id,
        topic.blocks.map(block =>
          block.type === "figure" ? block.assetId
          : block.type === "table" ? block.caption
          : block.type,
        ),
      ]),
    )

    expect(topicBlocks.get("task-1-poderes-del-estado-gobierno-e-instituciones")).toContain(
      "figure-7-1",
    )
    expect(topicBlocks.get("task-1-poder-legislativo")?.slice(-3)).toEqual([
      "list",
      "paragraph",
      "paragraph",
    ])
    expect(topicBlocks.get("task-1-provincias")).toContain("figure-13-7")
    expect(topicBlocks.get("task-1-administracion-electronica")).toContain("figure-15-8")
    expect(topicBlocks.get("task-1-poblacion")).toContain(
      "TABLA 2. Número de habitantes por comunidades autónomas",
    )
    expect(topicBlocks.get("task-1-participacion-ciudadana")).toContain(
      "TABLA 3. Relación de presidentes de Gobierno y sus partidos políticos entre 1979 y 2024",
    )
  })

  it("retains the complete Task 1 semantic inventory", () => {
    const task = manual.sections.find(section => section.id === "task-1")
    const blocks = task?.topics.flatMap(topic => topic.blocks) ?? []
    /** Count top-level Task 1 blocks of one semantic type. */
    const count = (type: (typeof blocks)[number]["type"]) =>
      blocks.filter(block => block.type === type).length
    const figures = blocks.flatMap(block =>
      block.type === "figure" ? [[block.assetId, block.caption]] : [],
    )
    const tables = blocks.flatMap(block =>
      block.type === "table" ? [[block.headers.length, block.rows.length]] : [],
    )

    expect({
      callouts: count("callout"),
      figures: count("figure"),
      lists: count("list"),
      paragraphs: count("paragraph"),
      tables: count("table"),
    }).toEqual({
      callouts: 13,
      figures: 8,
      lists: 4,
      paragraphs: 69,
      tables: 3,
    })
    expect(
      blocks
        .filter(block => block.type === "list")
        .reduce((total, block) => total + (block.type === "list" ? block.items.length : 0), 0),
    ).toBe(14)
    expect(figures).toEqual([
      ["figure-7-1", "FIGURA 1. Bandera de España"],
      ["figure-8-2", "FIGURA 2. Su Majestad el rey Felipe VI"],
      ["figure-8-3", "FIGURA 3. Bandera de la Unión Europea"],
      ["figure-9-4", "FIGURA 4. Los poderes del estado español"],
      ["figure-10-5", "FIGURA 5. Miembro de la Guardia Civil. © Barcex"],
      ["figure-11-6", "FIGURA 6. Sede del Instituto Cervantes en Madrid"],
      ["figure-13-7", "FIGURA 7. Comunidades autónomas y provincias"],
      ["figure-15-8", "FIGURA 8. Sede electrónica de la Seguridad Social."],
    ])
    expect(tables).toEqual([
      [3, 5],
      [6, 7],
      [3, 7],
    ])
  })

  it("preserves apparent Task 1 source errors without editorial rewriting", () => {
    const task = manual.sections.find(section => section.id === "task-1")
    const blocks = task?.topics.flatMap(topic => topic.blocks) ?? []
    const paragraphs = blocks.flatMap(block => (block.type === "paragraph" ? [block.text] : []))
    const tables = blocks.filter(block => block.type === "table")

    expect(paragraphs).toContain(
      "España se unió a la Comunidad Económica Europea (hoy Unión Europea) el 1 de enero de 1986. Desde entonces, España ha desarrollado siempre un papel activo en la construcción del proyecto europeo. España ha desempeñado cinco veces la Presidencia de turno semestral del Consejo de la Unión Europea: en 1989, 1995, 2002, 2010 y 2023).",
    )
    expect(
      paragraphs.filter(paragraph =>
        paragraph.startsWith("Los sindicatos en España tienen gran importancia."),
      ),
    ).toEqual([
      "Los sindicatos en España tienen gran importancia. Los más representativos participan tanto en negociaciones con empresarios y gobiernos como en el órgano consultivo económico del Gobierno, el Consejo Económico y Social.",
      "Los sindicatos en España tienen gran importancia. Los más representativos participan tanto en negociaciones con empresarios y gobiernos, como en el órgano consultivo económico del Gobierno, el Consejo Económico y Social.",
    ])
    expect(
      tables.find(table => table.type === "table" && table.caption?.startsWith("TABLA 2."))?.rows,
    ).toContainEqual([
      "Canarias",
      "2 238 754",
      "Galicia",
      "2 705 833",
      "Comunidad Valencia",
      "5 319 285",
    ])
  })
})
