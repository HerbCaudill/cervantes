import { describe, expect, it } from "vitest"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual } from "@/manual/types"
import { validateManual } from "@/manual/validateManual"

const manual = manualDraft as Manual

describe("manual extraction draft", () => {
  it("matches the reader schema after deterministic extraction", () => {
    expect(() => validateManual(manual)).not.toThrow()
  })

  it("uses sentence case for topic titles", () => {
    const uppercaseTitles = manual.sections
      .flatMap(section => section.topics)
      .map(topic => topic.title)
      .filter(
        title =>
          /\p{L}/u.test(title) &&
          title === title.toLocaleUpperCase("es") &&
          title !== title.toLocaleLowerCase("es"),
      )

    expect(uppercaseTitles).toEqual([])
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
        "Poderes del Estado, Gobierno e Instituciones",
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

  it("reconstructs Task 2 around every source heading instead of PDF pages", () => {
    const task = manual.sections.find(section => section.id === "task-2")

    expect(task?.topics.map(topic => [topic.id, topic.title])).toEqual([
      ["task-2-derechos-deberes-y-libertades", "Destacados derechos, deberes y libertades"],
      ["task-2-articulo-6", "Artículo 6"],
      ["task-2-articulo-10", "Artículo 10"],
      ["task-2-articulo-12", "Artículo 12"],
      ["task-2-articulo-14", "Artículo 14"],
      ["task-2-articulo-15", "Artículo 15"],
      ["task-2-articulo-16", "Artículo 16"],
      ["task-2-articulo-18", "Artículo 18"],
      ["task-2-articulo-19", "Artículo 19"],
      ["task-2-articulo-20", "Artículo 20"],
      ["task-2-articulo-22", "Artículo 22"],
      ["task-2-articulo-23", "Artículo 23"],
      ["task-2-articulo-25", "Artículo 25"],
      ["task-2-articulo-27", "Artículo 27"],
      ["task-2-articulo-28", "Artículo 28"],
      ["task-2-articulo-30", "Artículo 30"],
      ["task-2-articulo-31", "Artículo 31"],
      ["task-2-articulo-32", "Artículo 32"],
      ["task-2-articulo-37", "Artículo 37"],
      ["task-2-articulo-41", "Artículo 41"],
      ["task-2-articulo-43", "Artículo 43"],
      ["task-2-articulo-45", "Artículo 45"],
      ["task-2-articulo-47", "Artículo 47"],
      ["task-2-articulo-48", "Artículo 48"],
      ["task-2-articulo-51", "Artículo 51"],
      ["task-2-articulo-54", "Artículo 54"],
      ["task-2-articulo-117", "Artículo 117"],
      ["task-2-articulo-118", "Artículo 118"],
      ["task-2-articulo-119", "Artículo 119"],
    ])
  })

  it("joins Task 2 prose and numbered lists split across source pages", () => {
    const task = manual.sections.find(section => section.id === "task-2")
    const article31 = task?.topics.find(topic => topic.id === "task-2-articulo-31")
    const article54 = task?.topics.find(topic => topic.id === "task-2-articulo-54")

    expect(article31?.blocks[0]).toEqual({
      type: "list",
      style: "ordered",
      items: [
        "1. Todos los ciudadanos deben pagar unos impuestos para contribuir a sostener los gastos públicos de acuerdo a su capacidad económica.",
        "2. El gasto público administrará equitativamente los recursos públicos, es decir: de manera justa para todos.",
      ],
    })
    expect(article54?.blocks.slice(0, 2)).toEqual([
      {
        type: "paragraph",
        text: "El defensor del pueblo es designado por las Cortes Generales para la defensa de los derechos y libertades públicas de los ciudadanos. Tiene funciones de Alto Comisionado de las Cortes Generales y puede supervisar la actividad de la administración pública. [Los ciudadanos pueden dirigirse a él para denunciar casos de malas prácticas].",
      },
      {
        type: "paragraph",
        text: "[Los españoles, como miembros de la Unión Europea, también pueden dirigirse o plantear reclamaciones a las instituciones y organismos europeos, como el Tribunal de Justicia de la UE de Luxemburgo, o el Centro Europeo del Consumidor].",
      },
    ])
  })

  it("retains each Task 2 numbered and lettered list item exactly once", () => {
    const task = manual.sections.find(section => section.id === "task-2")
    const article20 = task?.topics.find(topic => topic.id === "task-2-articulo-20")

    expect(article20?.blocks[0]).toEqual({
      type: "list",
      style: "ordered",
      items: [
        "1. Se reconocen y protegen los derechos:",
        "a. A expresar y difundir libremente los pensamientos, ideas y opiniones por cualquier medio escrito u oral.",
        "b. A la producción y creación literaria, artística, científica y técnica.",
        "c. A que los profesores puedan impartir sus enseñanzas con libertad.",
        "d. A comunicar o recibir libremente información verdadera por cualquier medio de difusión (libertad de prensa).",
        "2. Todas estas libertades no tendrán ningún tipo de censura, su único límite es el respeto a los derechos reconocidos a los españoles y, especialmente, el derecho al honor, a la intimidad, a la propia imagen y a la protección de la juventud y de la infancia.",
      ],
    })
  })

  it("keeps Task 2 callouts with their articles and figures beside source-page topics", () => {
    const task = manual.sections.find(section => section.id === "task-2")
    const topicBlocks = new Map(
      task?.topics.map(topic => [
        topic.id,
        topic.blocks.map(block =>
          block.type === "figure" ? block.assetId
          : block.type === "callout" ?
            block.blocks
              .flatMap(calloutBlock =>
                calloutBlock.type === "paragraph" || calloutBlock.type === "heading" ?
                  [calloutBlock.text]
                : calloutBlock.type === "list" ? calloutBlock.items
                : [],
              )
              .join(" ")
          : block.type,
        ),
      ]),
    )

    expect(topicBlocks.get("task-2-derechos-deberes-y-libertades")).toContain("figure-28-9")
    expect(topicBlocks.get("task-2-articulo-19")?.join(" ")).toContain("El artículo 19 reconoce")
    expect(topicBlocks.get("task-2-articulo-20")?.join(" ")).toContain("El artículo 20 reconoce")
    expect(topicBlocks.get("task-2-articulo-22")).toContain("figure-30-10")
    expect(topicBlocks.get("task-2-articulo-28")?.join(" ")).toContain("El artículo 28 reconoce")
    expect(topicBlocks.get("task-2-articulo-31")).toContain("figure-30-11")
    expect(topicBlocks.get("task-2-articulo-41")?.join(" ")).toContain("El artículo 41 reconoce")
    expect(topicBlocks.get("task-2-articulo-45")?.join(" ")).toContain("El artículo 45 reconoce")
    expect(topicBlocks.get("task-2-articulo-54")).toContain("figure-31-12")
    expect(topicBlocks.get("task-2-articulo-117")?.join(" ")).toContain("El artículo 117 designa")
    expect(topicBlocks.get("task-2-articulo-119")).toContain("figure-32-13")
  })

  it("retains the complete Task 2 semantic inventory", () => {
    const task = manual.sections.find(section => section.id === "task-2")
    const blocks = task?.topics.flatMap(topic => topic.blocks) ?? []
    const figures = blocks.flatMap(block =>
      block.type === "figure" ? [[block.assetId, block.caption]] : [],
    )

    expect({
      callouts: blocks.filter(block => block.type === "callout").length,
      figures: blocks.filter(block => block.type === "figure").length,
      headings: blocks.filter(block => block.type === "heading").length,
      lists: blocks.filter(block => block.type === "list").length,
      paragraphs: blocks.filter(block => block.type === "paragraph").length,
    }).toEqual({
      callouts: 7,
      figures: 5,
      headings: 0,
      lists: 10,
      paragraphs: 23,
    })
    expect(
      blocks
        .filter(block => block.type === "list")
        .reduce((total, block) => total + (block.type === "list" ? block.items.length : 0), 0),
    ).toBe(27)
    expect(figures).toEqual([
      ["figure-28-9", "FIGURA 9. Primera página de la Constitución española de 1978"],
      ["figure-30-10", "FIGURA 10. Cartel por la unidad CNT UGT en la revolución española"],
      [
        "figure-30-11",
        "FIGURA 11. Recuento de votos en las elecciones municipales y forales realizadas el 28 de mayo de 2023. © Txo",
      ],
      [
        "figure-31-12",
        "FIGURA 12. Estanque del Parque del Retiro, Madrid, España.© Carlos Delgado",
      ],
      ["figure-32-13", "FIGURA 13. Tribunal Constitucional, Madrid. © Javier Perez Montes"],
    ])
  })

  it("preserves apparent Task 2 source errors without editorial rewriting", () => {
    const task = manual.sections.find(section => section.id === "task-2")
    const callouts =
      task?.topics.flatMap(topic =>
        topic.blocks.flatMap(block =>
          block.type === "callout" ?
            block.blocks.flatMap(calloutBlock =>
              calloutBlock.type === "paragraph" || calloutBlock.type === "heading" ?
                [calloutBlock.text]
              : calloutBlock.type === "list" ? calloutBlock.items
              : [],
            )
          : [],
        ),
      ) ?? []

    expect(callouts).toContain(
      "El artículo 45 reconoce el derecho del ciudadado a disfrutar de un medio ambiente adecuado para el desarrollo de la persona, así como el deber de conservarlo.",
    )
    expect(callouts).toContain(
      "El artículo 117 designa a los jueces como los responsables de administrar la justicia de forma independiente y responsable. Mientras que el artículo 18 obliga a los ciudadanos a cumplir con las sentencias de los jueces y tribunales y colaborar con ellos cuando éstos lo requieran.",
    )
  })

  it("reconstructs Task 3 around every source heading instead of PDF pages", () => {
    const task = manual.sections.find(section => section.id === "task-3")

    expect(task?.topics.map(topic => [topic.id, topic.title])).toEqual([
      ["task-3-geografia-fisica-y-politica", "Geografía física y política"],
      [
        "task-3-accidentes-geograficos-mas-importantes-de-espana",
        "Accidentes geográficos más importantes de España",
      ],
      ["task-3-el-clima", "El clima"],
      ["task-3-division-territorial-de-espana", "División territorial de España"],
    ])
  })

  it("joins Task 3 prose split across source pages and preserves source typography", () => {
    const task = manual.sections.find(section => section.id === "task-3")
    const blocks = task?.topics.flatMap(topic => topic.blocks) ?? []
    const paragraphs = blocks.flatMap(block => (block.type === "paragraph" ? [block.text] : []))

    expect(paragraphs).toContain(
      "España está situada en el sur de Europa y tiene frontera con Andorra, Francia, Portugal y Marruecos. Es el cuarto país más grande del continente, con una extensión de 505 944 km². Es uno de los países más montañosos de Europa, con una altitud media de 650 metros sobre el nivel del mar. La cifra oficial de habitantes es de 49 315 949 a 1 de julio de 2025.",
    )
    expect(paragraphs).toContain(
      "Montañas: las principales montañas de la península ibérica, de norte a sur, son los Pirineos, donde se sitúa el tercer monte más alto de España, el Aneto; el Sistema Central y los Sistemas Bético y Penibético, donde se localiza el segundo pico más alto de España, el Mulhacén, en Sierra Nevada. La montaña más alta de España es un volcán situado en la isla de Tenerife, el Teide.",
    )
    expect(paragraphs).not.toContain(
      "Montañas: las principales montañas de la península ibérica, de norte a sur, son los Pirineos, donde se sitúa el tercer monte más alto de España, el Aneto; el Sistema Central y los",
    )
  })

  it("keeps the complete Task 3 table and footnote as structured content", () => {
    const task = manual.sections.find(section => section.id === "task-3")
    const topic = task?.topics.find(topic => topic.id === "task-3-division-territorial-de-espana")
    const tables = topic?.blocks.filter(block => block.type === "table") ?? []
    const paragraphs =
      topic?.blocks.flatMap(block => (block.type === "paragraph" ? [block.text] : [])) ?? []

    expect(tables).toHaveLength(1)
    expect(tables[0]).toMatchObject({
      caption:
        "TABLA 4 Comunidades autónomas, provincias, capitales de provincia y capitales de comunidades autónomas",
      headers: [
        "Comunidades autónomas",
        "Provincias",
        "Capital de provincia",
        "Capital de la comunidad autónoma",
      ],
    })
    expect(tables[0]?.rows).toHaveLength(52)
    expect(tables[0]?.rows).toContainEqual(["Castilla-La Mancha", "Albacete", "Albacete", "Toledo"])
    expect(tables[0]?.rows).toContainEqual([
      "Castilla y León",
      "Ávila",
      "Ávila",
      "No hay una capital oficial. La sede de las administraciones está en Valladolid¹",
    ])
    expect(tables[0]?.rows).toContainEqual([null, "Valladolid", "VallaVdolid", null])
    expect(tables[0]?.rows.at(-1)).toEqual([null, "Melilla", null, null])
    expect(paragraphs).toContain(
      "1 En el Estatuto de Autonomía no se establece una capitalidad, pero la Junta de Castilla y León y las Cortes tienen su sede en Valladolid.",
    )
  })

  it("retains the complete Task 3 semantic inventory", () => {
    const task = manual.sections.find(section => section.id === "task-3")
    const blocks = task?.topics.flatMap(topic => topic.blocks) ?? []
    const figures = blocks.flatMap(block =>
      block.type === "figure" ? [[block.assetId, block.caption]] : [],
    )

    expect({
      callouts: blocks.filter(block => block.type === "callout").length,
      figures: blocks.filter(block => block.type === "figure").length,
      headings: blocks.filter(block => block.type === "heading").length,
      lists: blocks.filter(block => block.type === "list").length,
      paragraphs: blocks.filter(block => block.type === "paragraph").length,
      tables: blocks.filter(block => block.type === "table").length,
    }).toEqual({
      callouts: 5,
      figures: 15,
      headings: 0,
      lists: 1,
      paragraphs: 14,
      tables: 1,
    })
    expect(
      blocks
        .filter(block => block.type === "list")
        .reduce((total, block) => total + (block.type === "list" ? block.items.length : 0), 0),
    ).toBe(4)
    expect(figures).toEqual([
      [
        "figure-37-14",
        "FIGURA 14. Volcán de El Teide, el pico montañoso más alto de España, Tenerife, Islas Canarias. © Falk2",
      ],
      ["figure-38-15", "FIGURA 15. Mapa de ríos y mares de España"],
      [
        "figure-38-17",
        "FIGURA 17. Domingo en Córdoba a orillas del Guadalquivir, Rafael Romero Barros",
      ],
      ["figure-38-16", "FIGURA 16. Sistemas montañosos y picos más importantes."],
      [
        "figure-39-18",
        "FIGURA 18. Parque Nacional Sierra de Guadarrama, Madrid, España. © Mark Theobald",
      ],
      [
        "figure-39-19",
        "FIGURA 19. Faja de Pelay, Parque Nacional de Ordesa y Monte Perdido, Aragón. © Moahim",
      ],
      ["figure-40-20", "FIGURA 20. Localidad de Mancha Blanca, Lanzarote. © Marc-Lautenbacher"],
      ["figure-40-21", "FIGURA 21. Mapa político de España"],
      ["figure-40-22", "FIGURA 22. Costa Brava, Girona. © Gordito1869"],
      [
        "figure-41-23",
        "FIGURA 23. Vista de la Catedral de Palma de Mallorca. © Holger Uwe Schmitt",
      ],
      ["figure-41-24", "FIGURA 24. Ruta de los Molinos, Castilla-La Mancha"],
      ["figure-41-25", "FIGURA 25. Toledo. © Dmitry Dzhus"],
      ["figure-42-26", "FIGURA 26. Ovejas pastando en un dehesa, Trujillo, Extremadura. © LBM1948"],
      ["figure-42-27", "FIGURA 27. Cabo de Finisterre. © Deensel"],
      ["figure-42-28", "FIGURA 28. Fachadas típicas de Bilbao. © PA"],
    ])
  })

  it("preserves apparent Task 3 source errors without editorial rewriting", () => {
    const task = manual.sections.find(section => section.id === "task-3")
    const texts =
      task?.topics.flatMap(topic =>
        topic.blocks.flatMap(block =>
          block.type === "paragraph" ? [block.text]
          : block.type === "callout" ?
            block.blocks.flatMap(calloutBlock =>
              calloutBlock.type === "paragraph" ? [calloutBlock.text] : [],
            )
          : [],
        ),
      ) ?? []

    expect(texts).toContain(
      "Los parques nacionales de España son, en la actualidad: Islas Atlánticas de Galicia, Picos de Europa (Asturias, Castilla y León y Cantabria), Ordesa y Monte Perdido (Aragón), Aigüestortes y Estany de Sant Maurici (Cataluña), Monfragüe (Extremadura), Sierra de Guadarrama (Madrid), Cabañeros y Tablas de Daimiel (Castilla-La Mancha), Doñana, Sierra Nevada y Sierra de la Nieves (Andalucía), Archipiélago de Cabrera (Islas Baleares) y Caldera de Taburiente, Teide, Timanfaya y Garajonay (Canarias).",
    )
    expect(texts).toContain(
      "España en 1916 aprueba la primera Ley de Parques Nacionales, comvirtiéndose en uno de los primeros países de Europa en proteger su naturaleza.",
    )
  })
})
