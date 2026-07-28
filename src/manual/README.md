# Manual content

The manual reader owns its content model under `src/manual`; it does not import
from or share storage with the question bank.

`Manual` contains an ordered set of the five official task sections, their
deep-linkable topics, and a manifest of locally bundled figure assets. Topic
content is an ordered union of headings, paragraphs, lists, tables, figures,
and callouts. Tables always carry explicit column headers so the reader can
render labeled stacked records on narrow screens.

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

Task 1 has been reconstructed into source-heading topics and verified in full
against the checksum-pinned 2026 manual. Tasks 2–5 remain page-oriented
extraction drafts until their corresponding editorial verification is complete.
