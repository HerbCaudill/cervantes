# Question bank format

The CCSE question bank lives in [`questions.json`](./questions.json) — a single
JSON array of question objects. To seed or grow the bank, append objects to that
array. They're validated and normalized at load time by
[`parseQuestions`](../lib/parseQuestions.ts); malformed entries are skipped with a
console warning (they won't crash the app), so a bad row in a large import is easy
to spot and fix.

This format is intended for **bulk import**: a separate task compiles the full
~500-question pool, and the output can be dropped straight into `questions.json`.

## Fields

| Field         | Required | Description                                                                                                         |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `id`          | yes      | Stable unique id. **Never reuse or renumber** — review history (in `localStorage`) is keyed by it.                  |
| `section`     | yes      | Section/category key (string). Known keys get nice labels (see below); unknown keys are title-cased automatically.  |
| `type`        | yes      | `"true-false"` or `"multiple-choice"`.                                                                              |
| `prompt`      | yes      | The question text shown to the user.                                                                                |
| `answer`      | yes      | For `true-false`: a boolean (`true` = "Verdadero"). For `multiple-choice`: the 0-based index of the correct option. |
| `options`     | MC only  | Array of answer strings (≥2). Optional for `true-false` (defaults to `["Verdadero", "Falso"]`).                     |
| `explanation` | no       | Shown as feedback after answering.                                                                                  |

## Examples

True/false:

```json
{
  "id": "ccse-cg-0001",
  "section": "constitution-government",
  "type": "true-false",
  "prompt": "La forma política del Estado español es la monarquía parlamentaria.",
  "answer": true,
  "explanation": "Artículo 1.3 de la Constitución."
}
```

Multiple-choice:

```json
{
  "id": "ccse-geo-0002",
  "section": "geography",
  "type": "multiple-choice",
  "prompt": "¿Cuál es el río más largo de la península ibérica?",
  "options": ["El Ebro", "El Guadalquivir", "El Tajo", "El Duero"],
  "answer": 2,
  "explanation": "El Tajo mide algo más de 1.000 km."
}
```

## Known section keys

Defined in [`src/constants.ts`](../constants.ts) (`SECTION_LABELS`). Add new keys
there to give them a custom label; otherwise the key is title-cased for display.

- `constitution-government` — Gobierno, Constitución y leyes
- `territorial-organization` — Organización territorial
- `rights-participation` — Derechos y participación ciudadana
- `geography` — Geografía
- `culture-history` — Cultura e historia
- `society` — Sociedad y vida cotidiana
