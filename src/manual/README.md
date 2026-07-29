# Manual content

The manual reader owns its content model under `src/manual`; it does not import
from or share storage with the question bank.

`Manual` contains an ordered set of the five official task sections, their
deep-linkable topics, and a manifest of locally bundled figure assets. Topic
content is an ordered union of headings, paragraphs, lists, tables, and figures.
List items can contain recursively nested child lists; use the unmarked style
when the source text already supplies explicit labels. Tables always carry
explicit column headers so the reader can render labeled stacked records on
narrow screens.

IDs are persistent content keys, not display labels. Use the exported
`MANUAL_SECTION_IDS` values for sections. Namespace topic IDs under their
section (for example, `task-1-poder-legislativo`) and figure asset IDs with
`figure-`. Never rename or reuse an ID after content ships, because saved reader
state will depend on them. Public topic routes deliberately use semantic title
slugs with a source-order suffix, keeping page-oriented draft IDs out of URLs.

Every figure block references an entry in `Manual.assets`; asset paths point to
files bundled for offline use. Run `validateManual` before serializing imported
content. It rejects blank or empty content, duplicate IDs, malformed tables,
and figure references without a valid local asset, caption, or alt text.

## Routes

The Manual tab links to `/manual`, topics use
`/manual/:sectionId/:topicSlug`, and search stays inside the Manual destination
at `/manual/buscar`. `getManualTopicSlug` constructs topic links and
`findManualTopicBySlug` resolves direct routes. All in-app links use the browser
history API, so these paths are directly loadable and retain native back and
forward behavior.

## Reader components

`ManualScreen` resolves route IDs against the structured manual. The index
groups every topic under its task. `ManualTopicShell` renders semantic blocks
in source order and provides a running head, a direct link back to the main
index, and source-order previous/next links across task boundaries.

Reader blocks use native headings, paragraphs, lists, tables, figures, and
captions. At viewports below 640px, semantic tables become stacked records whose
cells retain their source column labels; wider viewports use conventional
tables. The official body text uses the same compact 16px size and 1.45 leading
in both layouts.

The PDF's sidebar callouts repeat ordinary body prose, so the importer omits
right-column text instead of storing or deduplicating it at runtime. Standalone
source visuals discovered beside those sidebars remain ordinary figure blocks
in their original reading position. The search screen lazily builds and caches
the resulting body-only index in bounded main-thread phases after its first
paint, while cached remounts render synchronously without eager module-load
work.

## Offline build

The production service worker precaches the application shell, compiled manual
content and search index, local font files, and every file under
`public/manual`. `pnpm build` verifies the generated Workbox manifest against
the current manual assets so newly added figures or formats cannot be omitted
silently. Use `pnpm test:pw:pwa` for the Chromium production-preview scenario
covering offline deep links, figures, search, navigation, progress, and
service-worker updates without loss of reader or flashcard state.

## Automated coverage

The reader suite is intentionally layered so content-scale checks do not need to
be repeated in every browser scenario:

| Concern                                                            | Primary coverage                                                                                                                          |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Schema and source integrity                                        | `tests/validateManual.test.ts`, `tests/manualDraft.test.ts`, and the Task 3–5 content goldens                                             |
| Semantic rendering and responsive layout                           | `components/tests/ManualReader.test.tsx`, `components/tests/ManualList.test.tsx`, `e2e/app.spec.ts`, and the task-specific browser suites |
| Routes, direct links, and history                                  | `tests/manualTopicRoutes.test.ts`, `navigation/tests/parseRoute.test.ts`, `tests/App.test.tsx`, and `e2e/app.spec.ts`                     |
| Search normalization, excerpts, highlighting, and lazy cache reuse | `search/tests/manualSearch.test.ts`, `components/tests/ManualSearch.test.tsx`, and `e2e/manual-search.spec.ts`                            |
| Progress, resume, corrupt state, and storage isolation             | `reader/tests`, `components/tests/ManualReader.test.tsx`, and `e2e/reader-progress.spec.ts`                                               |
| Offline assets and service-worker updates                          | `scripts/pwa/tests/verifyPwaBuild.test.ts` and `e2e/pwa/offline-reader.spec.ts`                                                           |
| Manual and practice coexistence                                    | `tests/App.test.tsx`, `e2e/app.spec.ts`, and the storage-isolation scenarios above                                                        |

The all-topic browser smoke test checks every semantic route at 390px for a
visible article and heading, horizontal overflow, and console or page errors.
The source-inventory test requires the structured asset manifest and
`public/manual` files to match exactly; the production build then proves those
assets are emitted and precached, while the browser suite decodes every
declared figure.

## QA sign-off

The 2026-07-29 content and responsive audit covered all 71 topic routes at
390 × 844 and 1280 × 900 in both light and dark palettes: 284 complete route
renders containing 440 figure instances, 44 table instances, and 1,696 topic
controls and links. The audit found no page, console, or network errors after
loading; no document overflow; no malformed 40px marginal rows; no inconsistent
body typography; no undecodable, out-of-bounds, or non-contained
figures; no missing captions; no mismatched mobile table labels (including
`null` source cells); and no topic control below the 44px target size.

Representative practice, manual index, search, and topic routes
were also checked at 390 × 844 for landmarks, keyboard focus visibility,
horizontal overflow, and 44px controls. Browser scenarios cover direct and
history navigation, previous/next links across task boundaries, search and
query history, progress and resume behavior, practice/manual switching, and
offline PWA navigation. The Felipe VI prose appears once, with its local figure
and caption intact.

The pass exposed and fixed two presentation defects: the six-column population
table clipped its final column at the wide reader measure, and light-palette
faint text had only 2.87:1 contrast against paper. The table now uses a fixed
layout with readable paired column proportions, and light faint text is 4.52:1.
Both have browser regressions in `e2e/app.spec.ts`.

## Extraction draft

Run `pnpm manual:extract` to download the checksum-pinned official 2026 PDF and
rebuild `manual.draft.json` plus the ordered figure crops under
`public/manual/figures`. The importer uses the PDF's semantic tags to remove
page furniture while retaining headings, prose, lists, tables, and captions and
omitting right-column sidebar callouts. Captioned artwork grids are split into
individual assets with their title, artist, and location metadata. It requires
Poppler's `pdftoppm` command for deterministic 144-DPI figure rendering. The
source population table is normalized during extraction from three horizontal
community/population pairs into one ordered two-column list.

The output is deliberately page-oriented draft content. Editorial verification
tasks reconstruct final topic boundaries, resolve reading-order anomalies, and
compare every block and crop with the source before the reader imports it.

Tasks 1–5 have been reconstructed into source-heading topics and verified in full
against the checksum-pinned 2026 manual.

Tasks 3–5 have complete ordered-content goldens in `tests/fixtures`. Each
digest is calculated from `JSON.stringify` on the full task section, so topic
and block order, every text value, list item, table header and cell (including
`null` cells), figure asset ID, and caption contribute to the golden.

To regenerate verified content, run `pnpm manual:extract`, reconstruct the task's
semantic topics, and audit every ordered block and figure crop against the
checksum-pinned source PDF. For Task 3 compare pages 37–42; for Task 4 compare
pages 46–65; for Task 5 compare pages 70–91. Include both numbered figures and
meaningful standalone source visuals. Only after that audit, update the
corresponding fixture's task digest, canonical character and UTF-8 byte counts,
topic and block counts, table row and cell counts, and source text audit. Keep
the audited source page range and PDF checksum in the fixture, then run that
task's unit and Playwright tests before accepting the new golden.
