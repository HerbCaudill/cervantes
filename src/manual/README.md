# Manual content

The manual reader owns its content model under `src/manual`; it does not import
from or share storage with the question bank.

`Manual` contains an ordered set of the five official task sections, their
deep-linkable topics, and a manifest of locally bundled figure assets. Topic
content is an ordered union of headings, paragraphs, lists, tables, figures,
and callouts. List items can contain recursively nested child lists; use the
unmarked style when the source text already supplies explicit labels. Tables
always carry explicit column headers so the reader can render labeled stacked
records on narrow screens.

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

The Manual tab links to `/manual`. Task indexes use
`/manual/:sectionId`, topics use `/manual/:sectionId/:topicSlug`, and search
stays inside the Manual destination at `/manual/buscar`. `getManualTopicSlug`
constructs topic links and `findManualTopicBySlug` resolves direct routes. All
in-app links use the browser history API, so these paths are directly loadable
and retain native back and forward behavior.

## Reader components

`ManualScreen` resolves route IDs against the structured manual. The index
links all five tasks and every topic, while each task also has its own compact
topic index. `ManualTopicShell` renders semantic blocks in source order and
provides a running head, source-order previous/next links across task
boundaries, and one link to the official source.

Reader blocks use native headings, paragraphs, lists, tables, figures, captions,
and note roles for source callouts. Their fixed 40px marginal column carries
compact article references, dates, and figure numbers without changing the body
measure. At viewports below 640px, semantic tables become stacked records whose
cells retain their source column labels; wider viewports use conventional
tables. The official body text remains 17px in both layouts.

The structured manual remains source-faithful when the PDF repeats body prose
inside a visual pull quote. `getVisibleManualBlocks` derives the reader and
search representation by removing callout sentences with at least 64
contiguous normalized characters already present in any non-callout block
across the manual. The comparison works in both containment directions and
retains complete unique sentences from mixed callouts. Each projection builds
one rolling-hash body-window index and reuses it for every callout, so overlap
checks scale with the callout text rather than the full body corpus. Hash hits
retain their source segment and offset, are verified against the original
normalized text, and extend only along consecutive source positions. Short
incidental matches stay visible, as do unique callout blocks and locally
bundled figures. The search screen lazily builds and caches this projection in
bounded main-thread phases after its first paint, while cached remounts render
synchronously without eager module-load work.

## Offline build

The production service worker precaches the application shell, compiled manual
content and search index, local font files, and every file under
`public/manual`. `pnpm build` verifies the generated Workbox manifest against
the current manual assets so newly added figures or formats cannot be omitted
silently. Use `pnpm test:pw:pwa` for the Chromium production-preview scenario
covering offline deep links, figures, search, navigation, progress, and
service-worker updates without loss of reader or flashcard state.

## Extraction draft

Run `pnpm manual:extract` to download the checksum-pinned official 2026 PDF and
rebuild `manual.draft.json` plus the ordered figure crops under
`public/manual/figures`. The importer uses the PDF's semantic tags to remove
page furniture while retaining headings, prose, lists, tables, captions, and
sidebar callouts. Captioned artwork grids are split into individual assets with
their title, artist, and location metadata. It requires Poppler's `pdftoppm`
command for deterministic 144-DPI figure rendering.

The output is deliberately page-oriented draft content. Editorial verification
tasks reconstruct final topic boundaries, resolve reading-order anomalies, and
compare every block and crop with the source before the reader imports it.

Tasks 1–5 have been reconstructed into source-heading topics and verified in full
against the checksum-pinned 2026 manual.

Tasks 3–5 have complete ordered-content goldens in `tests/fixtures`. Each
digest is calculated from `JSON.stringify` on the full task section, so topic
and block order, every text value, list item, table header and cell (including
`null` cells), callout, figure asset ID, and caption contribute to the golden.

To regenerate verified content, run `pnpm manual:extract`, reconstruct the task's
semantic topics, and audit every ordered block and figure crop against the
checksum-pinned source PDF. For Task 3 compare pages 37–42; for Task 4 compare
pages 46–65; for Task 5 compare pages 70–91. Include both numbered figures and
meaningful standalone source visuals. Only after that audit, update the
corresponding fixture's task digest, canonical character and UTF-8 byte counts,
topic and block counts, table row and cell counts, and source text audit. Keep
the audited source page range and PDF checksum in the fixture, then run that
task's unit and Playwright tests before accepting the new golden.
