import type { Card } from "@/types"

/**
 * The study deck. To add cards, append new entries to this array — each needs a
 * unique `id` (never reuse one, so review history stays attached to the right
 * card), a Spanish `front`, an `back` answer, a `category`, and optionally an
 * `example` sentence. Cards are picked up automatically; nothing else to wire.
 */
export const cards: Card[] = [
  {
    id: "vocab-aprovechar",
    front: "aprovechar",
    back: "to make the most of / take advantage of",
    example: "Hay que aprovechar el buen tiempo para salir.",
    category: "vocabulary",
  },
  {
    id: "vocab-imprescindible",
    front: "imprescindible",
    back: "essential / indispensable",
    example: "Es imprescindible reservar con antelación.",
    category: "vocabulary",
  },
  {
    id: "vocab-cotidiano",
    front: "cotidiano",
    back: "everyday / daily",
    example: "Forma parte de la vida cotidiana.",
    category: "vocabulary",
  },
  {
    id: "vocab-acontecimiento",
    front: "el acontecimiento",
    back: "the event / occurrence",
    example: "Fue el acontecimiento del año.",
    category: "vocabulary",
  },
  {
    id: "verb-haber-subj",
    front: "haber (presente de subjuntivo, yo)",
    back: "haya",
    example: "Espero que haya tiempo suficiente.",
    category: "verbs",
  },
  {
    id: "verb-poner-preterite",
    front: "poner (pretérito, yo)",
    back: "puse",
    example: "Puse las llaves sobre la mesa.",
    category: "verbs",
  },
  {
    id: "verb-conducir-preterite",
    front: "conducir (pretérito, ellos)",
    back: "condujeron",
    example: "Condujeron toda la noche hasta llegar.",
    category: "verbs",
  },
  {
    id: "expr-echar-de-menos",
    front: "echar de menos",
    back: "to miss (someone or something)",
    example: "Echo de menos a mi familia.",
    category: "expressions",
  },
  {
    id: "expr-dar-igual",
    front: "dar igual",
    back: "to not matter / to be all the same",
    example: "Me da igual dónde comamos.",
    category: "expressions",
  },
  {
    id: "expr-merecer-la-pena",
    front: "merecer la pena",
    back: "to be worth it",
    example: "Merece la pena visitar el museo.",
    category: "expressions",
  },
  {
    id: "gram-por-vs-para",
    front: "¿«por» o «para»?  «Estudio ___ aprobar el DELE.»",
    back: "para (purpose / goal)",
    example: "para + objetivo: «para aprobar».",
    category: "grammar",
  },
  {
    id: "gram-subjuntivo-ojala",
    front: "Tras «ojalá», ¿indicativo o subjuntivo?",
    back: "subjuntivo",
    example: "Ojalá llueva mañana.",
    category: "grammar",
  },
]
