import assert from "node:assert/strict"
import { existsSync, globSync, readFileSync, statSync } from "node:fs"
import { extname, relative } from "node:path"
import { PWA_GLOB_PATTERN, PWA_MAXIMUM_FILE_SIZE_TO_CACHE_IN_BYTES } from "./constants.ts"

/** Extensions that must be available from the production precache. */
const CACHEABLE_EXTENSIONS = new Set(
  PWA_GLOB_PATTERN.match(/\{(.+)\}/)?.[1]
    .split(",")
    .map(extension => `.${extension}`),
)

/** Assert that the production service worker contains the complete offline reader. */
export function verifyPwaBuild(): void {
  const allManualPaths = globSync("public/manual/**/*")
    .filter(path => statSync(path).isFile())
    .sort()
  const manualSourcePaths = allManualPaths.filter(path => extname(path).toLowerCase() !== ".pdf")
  const unsupportedManualAssets = manualSourcePaths.filter(
    path => !CACHEABLE_EXTENSIONS.has(extname(path)),
  )
  assert(
    unsupportedManualAssets.length === 0,
    `unsupported manual asset formats: ${unsupportedManualAssets
      .map(path => {
        const extension = extname(path) || "<none>"
        return `${relative("public", path)} (unsupported extension ${extension})`
      })
      .join(", ")}`,
  )
  const manualAssetPaths = manualSourcePaths.map(path => relative("public", path)).sort()

  const serviceWorkerPath = "dist/sw.js"
  assert(existsSync(serviceWorkerPath), "dist/sw.js must exist before verifying the PWA build")

  const serviceWorker = readFileSync(serviceWorkerPath, "utf8")
  const precacheUrls = new Set(
    [...serviceWorker.matchAll(/\burl:"([^"]+)"/g)].map(match => match[1]),
  )
  assert(
    manualAssetPaths.length >= 108,
    `expected at least 108 manual assets, found ${manualAssetPaths.length}`,
  )

  const expectedBuildAssets = globSync("dist/**/*")
    .filter(path => path !== "dist/sw.js" && !/dist\/workbox-[^/]+\.js$/.test(path))
    .filter(path => CACHEABLE_EXTENSIONS.has(extname(path)))
    .map(path => relative("dist", path))
    .sort()
  const omittedAssets = expectedBuildAssets.filter(path => !precacheUrls.has(path))
  assert.deepEqual(omittedAssets, [], `assets missing from precache: ${omittedAssets.join(", ")}`)

  const missingManualAssets = manualAssetPaths.filter(
    path => !existsSync(`dist/${path}`) || !precacheUrls.has(path),
  )
  assert.deepEqual(
    missingManualAssets,
    [],
    `manual assets missing from build or precache: ${missingManualAssets.join(", ")}`,
  )

  const oversizedAssets = expectedBuildAssets.filter(
    path => statSync(`dist/${path}`).size > PWA_MAXIMUM_FILE_SIZE_TO_CACHE_IN_BYTES,
  )
  assert.deepEqual(
    oversizedAssets,
    [],
    `assets exceed the configured precache limit: ${oversizedAssets.join(", ")}`,
  )

  const sourcePdfs = globSync("dist/**/*").filter(
    path => statSync(path).isFile() && extname(path).toLowerCase() === ".pdf",
  )
  assert.deepEqual(sourcePdfs, [], `source PDFs must not ship in dist: ${sourcePdfs.join(", ")}`)

  const applicationJavaScript = globSync("dist/assets/*.js")
    .map(path => readFileSync(path, "utf8"))
    .join("\n")
  const unreferencedManualAssets = manualAssetPaths.filter(
    path => !applicationJavaScript.includes(`/${path}`),
  )
  assert.deepEqual(
    unreferencedManualAssets,
    [],
    `manual assets missing from structured content: ${unreferencedManualAssets.join(", ")}`,
  )

  assert.match(serviceWorker, /createHandlerBoundToURL\("index\.html"\)/)
  assert.match(serviceWorker, /NavigationRoute/)
}
