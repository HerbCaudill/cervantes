import { describe, expect, it } from "vitest"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual, ManualBlock } from "@/manual/types"

const manual = manualDraft as Manual
const task = manual.sections.find(section => section.id === "task-4")
const topics = task?.topics ?? []
const blocks = topics.flatMap(topic => topic.blocks)

describe("verified Task 4 manual content", () => {
  it("reconstructs the source around its seven semantic headings", () => {
    expect(topics.map(topic => [topic.id, topic.title])).toEqual([
      ["task-4-literatura-musica-y-artes-escenicas", "LITERATURA, MÚSICA Y ARTES ESCÉNICAS"],
      ["task-4-arquitectura-y-artes-plasticas", "ARQUITECTURA Y ARTES PLÁSTICAS"],
      ["task-4-ciencia-y-tecnologia", "CIENCIA Y TECNOLOGÍA"],
      [
        "task-4-acontecimientos-relevantes-en-la-historia-de-espana",
        "ACONTECIMIENTOS RELEVANTES EN LA HISTORIA DE ESPAÑA (1252-2019)",
      ],
      ["task-4-fiestas-celebraciones-y-folclore", "FIESTAS, CELEBRACIONES Y FOLCLORE"],
      ["task-4-acontecimientos-culturales-y-deportivos", "ACONTECIMIENTOS CULTURALES Y DEPORTIVOS"],
      ["task-4-deportes", "DEPORTES"],
    ])
  })

  it("joins prose and lists split across source pages without fragments", () => {
    const paragraphs = getParagraphs(blocks)
    const lists = blocks.filter(block => block.type === "list")
    const serialized = JSON.stringify(task)

    expect(paragraphs).toContain(
      "Durante el Siglo de Oro, la literatura alcanzó un gran desarrollo en todos los géneros. En el teatro, destacaron autores como Lope de Vega, creador de la comedia nueva y autor de Fuenteovejuna, y Calderón de la Barca, cuya obra maestra es La vida es sueño. En la narrativa, surgió la novela picaresca en la que resalta el Lazarillo de Tormes, que muestra la vida difícil de un niño pobre y critica la sociedad de su tiempo. En el ámbito de la literatura religiosa y mística, destacan Santa Teresa de Jesús, con Camino de perfección, y San Juan de la Cruz, con sus poemas de profunda espiritualidad. En la poesía, encontramos a figuras como Garcilaso de la Vega, introductor de los modelos italianos; Luis de Góngora, con su estilo culterano; y Francisco de Quevedo, maestro de la sátira y el conceptismo.",
    )
    expect(paragraphs).toContain(
      "Sara Mesa es una escritora española contemporánea conocida por su estilo sobrio y directo. Sus novelas exploran las relaciones humanas, el deseo y el poder, con atmósferas tensas y pocos adornos. Su libro más conocido es Un amor, una historia corta e intensa sobre una mujer que intenta empezar de cero en un pueblo y se enfrenta a límites y abusos.",
    )
    expect(
      lists.find(list => list.type === "list" && list.items[0]?.startsWith("Los Premios Princesa"))
        ?.items,
    ).toHaveLength(8)
    expect(serialized).not.toMatch(
      /draft-page|\"text\":\"Re\"|histórico -artístico|c\\. 1043– 1099/,
    )
  })

  it("preserves the complete chronology in one source table", () => {
    const history = topics.find(
      topic => topic.id === "task-4-acontecimientos-relevantes-en-la-historia-de-espana",
    )
    const tables = history?.blocks.filter(block => block.type === "table") ?? []
    const table = tables[0]

    expect(tables).toHaveLength(1)
    expect(table?.caption).toBe("TABLA 5. Acontecimientos relevantes en la historia de España")
    expect(table?.headers).toEqual(["Fecha", "Época histórica", "Descripción"])
    expect(table?.rows.map(row => row[0])).toEqual([
      "1252",
      "1492",
      "1519",
      "Siglos XVI-XVII",
      "1705-1715",
      "1808-1814",
      "1895-1898",
      "1936-1939",
      "1939-1975",
      "1975-1982",
      "1978",
      "1986",
      "1992",
      "2014",
    ])
    expect(table?.rows[3]).toEqual([
      "Siglos XVI-XVII",
      "Siglo de Oro del Imperio español",
      "Fue el primer imperio con grandes extensiones de territorio en todos los continentes, que incluía los territorios de América, del Pacífico, de Italia y de la Europa central. Los reinados más importantes de este período son los de Carlos I y Felipe II. A Carlos I se le considera el primer rey de España, porque con él se unificaron los distintos reinos de la península ibérica. Felipe II gobernó la mayor extensión de territorios del mundo por la unificación de los reinos de España y Portugal y sus respectivos territorios en América y Asia.",
    ])
    expect(table?.rows[10]?.[2]).toContain("88 % a favor")
  })

  it("keeps every numbered figure in source order with its exact caption", () => {
    const figures = blocks.flatMap(block =>
      block.type === "figure" && !block.assetId.includes("-artwork-") ?
        [[block.assetId, block.caption]]
      : [],
    )

    expect(figures).toEqual([
      [
        "figure-46-29",
        "FIGURA 29. Don Quijote y Sancho Panza, personajes principales de la novela El ingenioso hidalgo don Quijote de la Mancha de Miguel de Cervantes",
      ],
      ["figure-47-30", "FIGURA 30. Retrato de Antonio Machado. © Autor desconocido."],
      [
        "figure-47-31",
        "FIGURA 31. Manuscrito de La casa de Bernarda Alba, 1936. © Colección Fundación Federico García Lorca",
      ],
      [
        "figure-48-32",
        "FIGURA 32. Portada de El infinito en un junco de Irene Vallejo, Editorial Siruela",
      ],
      [
        "figure-49-33",
        "FIGURA 33. Rosalía, una de las cantantes españolas más famosas de la actualidad. © Pedro J Pacheco",
      ],
      ["figure-50-34", "FIGURA 34. Fotograma de Un perro Andaluz de Luis Buñuel. © Jennifer Mei"],
      [
        "figure-50-35",
        "FIGURA 35. Cartel de promoción de la película La Librería de la directora de cine Isabel Coixet",
      ],
      ["figure-51-37", "FIGURA 37. Mezquita de Córdoba. © Salvatorecoco"],
      ["figure-51-36", "FIGURA 36. La Alhambra de Granada. © Jebulon"],
      ["figure-52-39", "FIGURA 39. Museo Guggenheim, Bilbao. © Naotake Murayama"],
      [
        "figure-52-38",
        "FIGURA 38. Museo del Prado, Madrid. Museo del Prado, Madrid. © Emilio J. Rodríguez Posada",
      ],
      ["figure-53-40", "FIGURA 40. Museo Reina Sofía, Madrid. © Luis García"],
      ["figure-53-41", "FIGURA 41. Museo Picasso, Barcelona. © uayebt"],
      [
        "figure-54-42",
        "FIGURA 42. Palacio de Villahermosa (Museo Thyssen-Bornemisza). © Luis García",
      ],
      ["figure-54-43", "FIGURA 43. Fundación Miró, Barcelona. © Amador Álvarez"],
      ["figure-55-44", "FIGURA 44. Centro Pompidou, Málaga. © Epizentrum"],
      ["figure-55-45", "FIGURA 45. Teatro-Museo Dalí, Figueres. © Luidger"],
      [
        "figure-56-46",
        "FIGURA 46. Observatorio de Calar Alto, es el observatorio astronómico más grande de Europa. © Digigalos",
      ],
      ["figure-57-47", "FIGURA 47. Alfonso X el Sabio en El libro de los juegos"],
      ["figure-57-48", "FIGURA 48. Las Capitulaciones de Granada, Francisco Pradilla y Ortiz."],
      [
        "figure-58-49",
        "FIGURA 49. Alegoría del emperador Carlos V como «gobernante del mundo», de Rubens.",
      ],
      [
        "figure-58-50",
        "FIGURA 50. Artilleros republicanos en el Fuerte de San Marcos, 1936, de Pascual Marín. © Fondo Marín-Kutxa Fototeka",
      ],
      [
        "figure-58-51",
        "FIGURA 51. Entrada de las tropas nacionales en San Sebastián (42/54), de Pascual Marín. © Fondo Marín-Kutxa Fototeka",
      ],
      [
        "figure-59-52",
        "FIGURA 52. Anverso de una moneda de cinco pesetas acuñada en 1949, con la efigie de Franco y la leyenda. © MrCharro",
      ],
      ["figure-59-53", "FIGURA 53. Carteles oficiales del Referéndum. © Anefo"],
      [
        "figure-59-54",
        "FIGURA 54. Emblema oficial para los juegos de la XXV olimpiada Barcelona 1992, de Josep Maria Trias",
      ],
      [
        "figure-60-56",
        "FIGURA 56. Sevilla. El baile, de Joaquín Sorolla. Colección Sociedad Hispánica de América",
      ],
      ["figure-60-55", "FIGURA 55. Mascletá en la plaza del Ayuntamiento, Valencia. © MrCarlos11"],
      ["figure-61-57", "FIGURA 57. Paco de Lucía. © Cornel Putan"],
      [
        "figure-61-58",
        "FIGURA 58. Semana Santa 2005 en El Puerto de Santa María, Andalucía. © Emilio J. Rodríguez Posada",
      ],
      [
        "figure-62-59",
        "FIGURA 59. Puesto de venta de rosas en la Diada de Sant Jordi, Cataluña. © Francis Lenn",
      ],
      ["figure-62-60", "FIGURA 60. Arrojando tomates desde un camión, La Tomatina 2010. © flydime"],
      [
        "figure-62-61",
        "FIGURA 61. Corriendo un encierro en sanfermines 2014, Pamplona-Iruña. © Guia Ilustrada",
      ],
      [
        "figure-63-62",
        "FIGURA 62. Acto de entrega del Premio Cervantes a Ida Vitale, en 2019, en el Paraninfo de la Universidad de Alcalá. © Pool Moncloa/Borja Puig de la Bellacasa",
      ],
      ["figure-63-63", "FIGURA 63. Feria del Libro 2023. Madrid. © Zarateman"],
      ["figure-64-64", "FIGURA 64. Festival de Teatro Clásico de Mérida. © Ayuntamiento de Mérida"],
      [
        "figure-64-65",
        "FIGURA 65. Vicente Aleixandre y Merlo, Premio Nobel de Literatura, 1977. © Anefo",
      ],
      ["figure-65-66", "FIGURA 66. Alcaraz en el Torneo de Roland Garros 2021. © Yannick JAMOT"],
      ["figure-65-67", "FIGURA 67. La nadadora Mireia Belmonte © Mauricio V. Genta"],
    ])
  })

  it("keeps every artwork as one separately captioned figure without duplicate metadata tables", () => {
    const architecture = topics.find(topic => topic.id === "task-4-arquitectura-y-artes-plasticas")
    const artworks =
      architecture?.blocks.filter(
        block => block.type === "figure" && block.assetId.includes("-artwork-"),
      ) ?? []

    expect(artworks.map(block => (block.type === "figure" ? block.caption : ""))).toEqual([
      "San Francisco en oración — Francisco de Zurbarán (1598-1664) — Museo del Prado Madrid",
      "Las meninas — Diego Rodríguez de Silva y Velázquez (1599-1660) — Museo del Prado Madrid",
      "Los fusilamientos del 3 de mayo — Francisco de Goya (1746-1828) — Museo del Prado Madrid",
      "La maja desnuda — Francisco de Goya (1746-1828) — Museo del Prado Madrid",
      "Guernica — Pablo Picasso (1881-1973) — Museo Reina Sofía Madrid",
      "Paseo a la orilla del mar — Joaquín Sorolla (1863-1923) — Casa Museo Sorolla Madrid",
      "Logotipo de Turespaña — Joan Miró (1893-1983) — Mural del Palacio de Congresos de Madrid",
      "La verbena — Maruja Mallo (1902-1995) — Museo Reina Sofía Madrid",
      "Figura en una ventana — Salvador Dalí (1904-1989) — Museo Reina Sofía Madrid",
      "Madrid desde Capitán Haya — Antonio López (1936) — Museo Reina Sofía Madrid",
    ])
    expect(architecture?.blocks.filter(block => block.type === "table")).toHaveLength(0)
  })

  it("retains every Task 4 list, data table, callout, and cultural figure", () => {
    const count = (type: ManualBlock["type"]) => blocks.filter(block => block.type === type).length
    const tables = blocks.filter(block => block.type === "table")
    const callouts = blocks.flatMap(block =>
      block.type === "callout" ? getParagraphs(block.blocks) : [],
    )

    expect({
      callouts: count("callout"),
      figures: count("figure"),
      lists: count("list"),
      tables: count("table"),
    }).toEqual({ callouts: 5, figures: 49, lists: 5, tables: 3 })
    expect(tables.map(table => (table.type === "table" ? table.caption : undefined))).toEqual([
      "TABLA 5. Acontecimientos relevantes en la historia de España",
      "TABLA 6. Fiestas españolas más conocidas",
      "TABLA 7. Españoles galardonados con el premio Nobel",
    ])
    expect(callouts).toEqual([
      "En el siglo XX, la literatura vivió otro gran momento con autores como Antonio Machado, Miguel de Unamuno, Valle-Inclán, José Ortega y Gasset, Clara Campoamor y Federico García Lorca, etre muchos otros.",
      "En los años 90 y 2000, la memoria histórica se volvió un tema recurrente entre escritores, entre los que destacan Almudena Grandes, Javier Cercas y Fernando Aramburu, entre otros.",
      "Con la llegada de la Transición, la movida madrileña abrió la puerta a la experimentación y a la modernidad urbana, mientras artistas como Joaquín Sabina encarnaban la mezcla de crónica social, ironía y bohemia, consolidando un movimiento musical que estaba entre la memoria de la tradición y la búsqueda de libertad creativa.",
      "En la historia del cine español, resulta imprescindible mencionar a Luis Buñuel, considerado uno de los directores más importantes e influyentes del cine mundial, especialmente por su relación con el surrealismo y su capacidad de provocar reflexiones sociales y políticas a través de la imagen.",
      "Además de los museos nacionales del Prado y Reina Sofía, hay otros muy conocidos internacionalmente: el Museo Picasso, en Barcelona; el Museo Thyssen-Bornemisza, en Madrid, y el Museo Guggenheim de Bilbao.",
    ])
  })
})

/** Get all top-level paragraph text from semantic blocks. */
function getParagraphs(
  /** Blocks to inspect */
  sourceBlocks: readonly ManualBlock[],
): string[] {
  return sourceBlocks.flatMap(block => (block.type === "paragraph" ? [block.text] : []))
}
