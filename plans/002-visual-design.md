# Visual design: Boletín

## Goal

Replace the scaffold's default styling (stock shadcn neutrals, Geist) with a
deliberate visual identity, and specify it tightly enough that it can be
implemented without re-litigating the design.

The direction is **Boletín**: the app as an official document, borrowing from the
typography of Spanish legal publishing. Questions are set like numbered articles
with their id in the margin; the manual and the flashcards look like the same
artifact because structurally they are. It was chosen over two alternatives
("Cartilla", an identity-document metaphor with a bottom tab bar, and "Noche", a
dark-first reading-led design) as the cheapest to build, the only one where
reader and practice cards read as one document, and the one whose typographic
approach scales to the manual's real content — tables, callouts, figure captions
— without needing new components.

Decided: two tabs, no search tab, all in-app copy in Spanish, and IBM Plex
throughout. Scheduler diagnostics stay out of the interface for now: show
actionable due-question counts, but not learned counts, future forecasts,
per-question scheduling state, or interval previews.

## Design tokens

### Color — light

| Token         | Value     | Use                                                                                                                                                   |
| ------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--paper`     | `#f3f3ef` | Page ground. Slightly green-grey, not cream.                                                                                                          |
| `--ink`       | `#14161a` | Body text, hard rules, the bottom action bar.                                                                                                         |
| `--soft`      | `#5c5f5a` | Explanations, secondary chrome.                                                                                                                       |
| `--faint`     | `#8e918a` | Labels, inactive tabs, zero values.                                                                                                                   |
| `--rule`      | `#d5d5cb` | Hairline separators (the workhorse).                                                                                                                  |
| `--rule-hard` | `#a8a89e` | Structural rules: table heads, block quotes.                                                                                                          |
| `--red`       | `#a51c30` | The single accent. Due counts, active tab, margin numbers, explanation rule. Appears about twice per screen — if it appears more, something is wrong. |
| `--green`     | `#2f6b4f` | Correct answers only. Not a general-purpose accent.                                                                                                   |

### Color — dark

Not designed in the mockups; this is a derivation, not a validated palette, and
needs a contrast pass before shipping. Do not produce it by inverting the light
values.

| Token         | Value     |
| ------------- | --------- |
| `--paper`     | `#17181a` |
| `--ink`       | `#e8e7e0` |
| `--soft`      | `#a3a49d` |
| `--faint`     | `#74766f` |
| `--rule`      | `#2e3033` |
| `--rule-hard` | `#45474a` |
| `--red`       | `#d4707c` |
| `--green`     | `#7fb99c` |

### Typography

Three faces, each with a fixed job. Never mix the jobs — a number in the body
column is still set in mono, a heading in the chrome is still set in sans.

| Face               | Job                                                               |
| ------------------ | ----------------------------------------------------------------- |
| **IBM Plex Serif** | Everything you read: prompts, option text, manual body, headings. |
| **IBM Plex Sans**  | Chrome: labels, tabs, table text, buttons, running heads.         |
| **IBM Plex Mono**  | Data: question ids, article numbers, dates, counts.               |

Packages — note that **only Sans has a variable build**; Serif and Mono are
static, so import just the weights listed and no others, to keep the PWA
precache small.

```
pnpm remove @fontsource-variable/geist
pnpm add @fontsource-variable/ibm-plex-sans   # variable
pnpm add @fontsource/ibm-plex-serif           # static: 400, 700 only
pnpm add @fontsource/ibm-plex-mono            # static: 400 only
```

### Scale

Real device pixels at a 390px viewport. Nothing goes below 10px.

| Element                 | Face  | Size / leading     | Notes                |
| ----------------------- | ----- | ------------------ | -------------------- |
| Question prompt         | serif | 20 / 1.3           | Do not shrink.       |
| Manual body             | serif | 17 / 1.5           | Do not shrink.       |
| Option text             | serif | 16 / 1.3           |                      |
| Topic heading           | serif | 23 / 1.12, wt 700  | `text-wrap: balance` |
| Block quotation         | serif | 16 / 1.4, italic   |                      |
| Section label           | sans  | 11, tracking .14em | uppercase            |
| Table body              | sans  | 13                 | `tabular-nums`       |
| Table header            | sans  | 10, tracking .1em  | uppercase            |
| Tabs                    | sans  | 12, tracking .11em | uppercase            |
| Grade label             | sans  | 12, tracking .1em  | uppercase, wt 700    |
| Masthead title          | sans  | 12, tracking .18em | uppercase, wt 700    |
| Masthead counts         | mono  | 11                 | `tabular-nums`       |
| Margin id / article no. | mono  | 10.5 / 1.35        | `tabular-nums`       |

Use `font-variant-numeric: tabular-nums` anywhere digits stack in a column.

## Layout rules

These three do most of the work; get them right and the rest follows.

1. **Rules, not gaps.** Separate things with a 1px rule rather than whitespace.
   A gap costs 16px, a rule costs 1. This is what makes the design dense, and
   it's the single change with the largest effect.
2. **A fixed marginal column.** A 40px (2.5rem) left column with a 0.6rem gutter
   carries every question id, article number, and key date. The main column then
   keeps one measure and never breaks it to accommodate them. This is the
   signature of the direction.
3. **Density stops at the reading text.** The prompt and manual body do not get
   smaller — shrinking them trades real legibility for the appearance of
   density. Tighten the chrome around them instead.

Horizontal body padding is 0.9rem; vertical gap between blocks is 0.85rem.

Tap targets stay ≥ 44px. Option rows read as ruled lines but their hit areas
extend over the rules, so nothing becomes harder to hit.

## Navigation

Two top-level tabs: **Práctica** and **Manual**. No bottom tab bar, no search
tab. Search returns as a control inside Manual when the reader ships (plan 001);
until then there is nothing to search.

The masthead carries live counts on every screen. The right end of the tab row
holds a single contextual action (`Salir` during a session) or nothing.

## Screens

### 1. Práctica — resting

What you land on before starting, and what you return to when the queue empties.
This replaces the empty state that would otherwise have needed its own design.

Top to bottom: sections table (`Sección / Pend. / Banco` with a totals row);
manual reading progress by tarea, where the 1px rule under each row doubles as
its progress bar; a `Seguir leyendo` row; and a full-width bottom bar in `--ink`
reading `Empezar repaso · N preguntas`. Do not show learned counts or a future
due forecast.

### 2. Práctica — answering

A queue strip of one tick per card (green pass, red fail, ink current, grey
remaining). Then the question: id in the margin, section label, prompt, options
as ruled rows lettered a–d in mono, explanation behind a `--red` left rule.

Do not show the question's persisted scheduling state. Ease factor, repetition
count, last-review date, and interval remain implementation details.

Bottom bar: three grades, with `Bien` faintly tinted as the default. Do not
preview their resulting intervals. A wrong answer replaces all three with a
single `Otra vez`.

### 3. Manual — topic

Running head (section name, `T1 · 04`) and a hairline progress bar under the
masthead. Topic heading, then body paragraphs each paired with a marginal note —
an article number, a year, a keyword. Tables use the same dense table style as
the sections table. A `5 preguntas · 2 pendientes → Practicar` row links the
topic to the bank. Footer: `‹ Anterior` / `Siguiente ›`.

## Copy

All in-app copy is Spanish. Comments, identifiers, and docs stay English.

| On screen              | Meaning                                                        |
| ---------------------- | -------------------------------------------------------------- |
| Pendientes             | Questions due today                                            |
| Banco                  | Total questions in the bank for that section                   |
| Empezar repaso         | Start the session                                              |
| Difícil / Bien / Fácil | The three grades after a correct answer (`hard`/`good`/`easy`) |
| Otra vez               | The single action after a wrong answer (`again`); requeues it  |
| Seguir leyendo         | Resume at the last reading position                            |
| Salir                  | Leave the session                                              |
| Practicar              | Jump to this topic's due questions                             |

## Tasks

1. Swap the fonts: remove Geist, add the three Plex packages, import only the
   listed weights, and wire `--font-serif` / `--font-sans` / `--font-mono` in
   `src/index.css`.
2. Replace the shadcn neutral scale in `src/index.css` with the tokens above,
   both themes, and do a contrast pass on the dark values.
3. Add a `getSectionStats` helper for the due / bank counts.
4. Restyle `QuestionCard` to the marginal-column layout with ruled options.
5. Translate all UI copy to Spanish, including `GradeControls`.
6. Build the Práctica resting screen; wire it as both the pre-session and
   queue-empty state.
7. Restyle `DeckHeader` as the masthead plus tab row.
8. Unit-test `getSectionStats`; update the existing Playwright specs for the
   Spanish copy and the absence of scheduler diagnostics.

## Acceptance criteria

- No stock shadcn neutrals or Geist remain; all color and type flows through the
  tokens above.
- The marginal column holds ids and article numbers without the main column
  reflowing around them.
- Prompt and manual body render at 20px and 16px respectively, with 1.45 leading
  for manual paragraphs and lists.
- Every tap target measures ≥ 44px.
- All user-visible copy is Spanish; the glossary above is the authority.
- No learned count, future due forecast, per-question scheduling state, or grade
  interval preview is visible.
- `--red` appears roughly twice per screen, `--green` only on correct answers.
- Type checks, unit tests, and Playwright specs pass.

## Unresolved questions

- **Does the 40px marginal column survive real manual content?** Article numbers
  and question ids fit comfortably. Figure numbers and long captions from the
  extracted manual may not. Worth checking against a real topic once plan 001
  lands, before committing the reader to this layout.
- **The dark palette is underived.** It has not been seen in the mockups or
  contrast-checked. If dark mode matters, it deserves its own pass rather than
  shipping the values above unexamined.

## Reference

Rendered mockups of all three screens, plus the two rejected directions:
<https://claude.ai/code/artifact/e1da3d6d-61d4-4a35-b263-c6d614cb78cd>

The artifact is private and may not be reachable. This document is meant to be
sufficient on its own.
