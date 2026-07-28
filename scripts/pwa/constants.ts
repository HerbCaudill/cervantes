/** File types that form the complete offline application and reader bundle. */
export const PWA_GLOB_PATTERN =
  "**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,avif,gif,woff,woff2,json}"

/** Upper bound for a single precached asset, including future manual image formats. */
export const PWA_MAXIMUM_FILE_SIZE_TO_CACHE_IN_BYTES = 5 * 1024 * 1024
