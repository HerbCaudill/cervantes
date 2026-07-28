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
