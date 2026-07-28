# Question bank format

The CCSE question bank lives in [`questions.json`](./questions.json) as a single
JSON array. It contains the 300 official questions from the Instituto Cervantes
[2026 preparation manual](https://examenes.cervantes.es/sites/default/files/manual-ccse-2026-def.pdf).

Regenerate it from the official PDF with:

```bash
pnpm questions:import
```

The TypeScript importer downloads the manual, extracts the five task sections
and answer tables, verifies every official ID and answer shape, and then
overwrites `questions.json`. The app validates and normalizes the result at load
time with [`parseQuestions`](../lib/parseQuestions.ts). The importer also pins
the PDF checksum, so a revised official manual must be reviewed explicitly
before updating the source metadata in `scripts/ccse-import/constants.ts`.

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
  "id": "2003",
  "section": "rights-participation",
  "type": "true-false",
  "prompt": "En España, la Constitución prohíbe la tortura y la pena de muerte.",
  "answer": true
}
```

Multiple-choice:

```json
{
  "id": "1001",
  "section": "constitution-government",
  "type": "multiple-choice",
  "prompt": "España es…",
  "options": ["una monarquía parlamentaria.", "una república federal.", "una monarquía federal."],
  "answer": 0
}
```

## Known section keys

Defined in [`src/constants.ts`](../constants.ts) (`SECTION_LABELS`). Add new keys
there to give them a custom label; otherwise the key is title-cased for display.

- `constitution-government` — Gobierno, legislación y participación ciudadana
- `territorial-organization` — Organización territorial de España. Geografía física y política
- `rights-participation` — Derechos y deberes fundamentales
- `geography` — Geografía
- `culture-history` — Cultura e historia de España
- `society` — Sociedad española
