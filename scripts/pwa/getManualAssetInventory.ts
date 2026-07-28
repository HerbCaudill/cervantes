import { globSync, statSync } from "node:fs"
import { extname, relative } from "node:path"
import { PWA_CACHEABLE_EXTENSIONS } from "./constants.ts"

/** Inventory every non-PDF manual file and identify formats Workbox cannot precache. */
export function getManualAssetInventory(): ManualAssetInventory {
  const supportedExtensions = new Set<string>(PWA_CACHEABLE_EXTENSIONS)
  const sourcePaths = globSync("public/manual/**/*")
    .filter(path => statSync(path).isFile())
    .filter(path => extname(path).toLowerCase() !== ".pdf")
    .sort()

  return {
    assetPaths: sourcePaths.map(path => relative("public", path)),
    unsupportedPaths: sourcePaths.filter(path => !supportedExtensions.has(extname(path))),
  }
}

interface ManualAssetInventory {
  /** Non-PDF manual files relative to the public directory */
  assetPaths: string[]
  /** Manual source paths whose exact extension is not part of the Workbox glob */
  unsupportedPaths: string[]
}
