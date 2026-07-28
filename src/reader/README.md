# Reader progress

Manual progress is stored locally under `cervantes:manual-reader:v1`, separately
from flashcard scheduling history. The saved schema records the last semantic
topic ID plus each topic's latest document offset and furthest fractional
progress. Task percentages are derived from those per-topic maxima.

`useReaderProgress` coalesces writes while scrolling and flushes at navigation,
unmount, and `pagehide`. Resume and topic-index links intentionally restore a
saved offset; previous/next links start at the top. Browser history and URL
anchors retain their native scroll behavior.

Unsupported schemas, corrupt JSON, and topic IDs no longer present in the
current manual are discarded safely.
