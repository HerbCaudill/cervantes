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
`figure-`. Never rename or reuse an ID after content ships, because routes and
saved reader state will depend on them.

Every figure block references an entry in `Manual.assets`; asset paths point to
files bundled for offline use. Run `validateManual` before serializing imported
content. It rejects blank or empty content, duplicate IDs, malformed tables,
and figure references without a valid local asset, caption, or alt text.

## Routes

The Manual tab links to `/manual`. Task indexes use
`/manual/:sectionId`, topics use `/manual/:sectionId/:topicId`, and search stays
inside the Manual destination at `/manual/buscar`. All in-app links use the
browser history API, so these paths are directly loadable and retain native
back and forward behavior.

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
