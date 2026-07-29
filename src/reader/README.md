# Reader progress

Manual progress is stored locally under `cervantes:manual-reader:v1`, separately
from flashcard scheduling history. The saved schema records the last semantic
topic ID plus each topic's latest tarea-document offset and furthest fractional
progress. Task percentages are derived from those per-topic maxima.

`useReaderProgress` measures every topic section in the active continuous tarea,
coalesces writes while scrolling, and flushes at navigation, unmount, and
`pagehide`. Resume, index, search, and in-page links all target stable heading
anchors. The app restores anchors after routed renders while same-page links and
browser history retain native behavior.

Unsupported schemas, corrupt JSON, and topic IDs no longer present in the
current manual are discarded safely.
