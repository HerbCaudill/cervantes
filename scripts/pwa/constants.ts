/** File extensions that form the complete offline application and reader bundle. */
export const PWA_CACHEABLE_EXTENSIONS = [
  ".js",
  ".css",
  ".html",
  ".ico",
  ".png",
  ".svg",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
  ".gif",
  ".woff",
  ".woff2",
  ".json",
] as const

/** Workbox glob derived from the authoritative cacheable extension inventory. */
export const PWA_GLOB_PATTERN = `**/*.{${PWA_CACHEABLE_EXTENSIONS.map(extension =>
  extension.slice(1),
).join(",")}}`

/** Upper bound for a single precached asset, including future manual image formats. */
export const PWA_MAXIMUM_FILE_SIZE_TO_CACHE_IN_BYTES = 5 * 1024 * 1024
