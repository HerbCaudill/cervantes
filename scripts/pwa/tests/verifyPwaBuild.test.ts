import { rmSync, writeFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { getManualAssetInventory } from "../getManualAssetInventory.ts"
import { verifyPwaBuild } from "../verifyPwaBuild.ts"

describe("verifyPwaBuild", () => {
  it("accepts every currently supported manual figure", () => {
    const inventory = getManualAssetInventory()

    expect(inventory.assetPaths.length).toBeGreaterThanOrEqual(108)
    expect(inventory.unsupportedPaths).toEqual([])
  })

  it.each(["pwa-unsupported-fixture.tif", "figures/pwa-unsupported-fixture.tiff"])(
    "reports the path and extension for unsupported manual asset %s",
    assetPath => {
      const unsupportedAssetPath = `public/manual/${assetPath}`
      writeFileSync(unsupportedAssetPath, "unsupported")

      try {
        expect(() => verifyPwaBuild()).toThrow(
          `manual/${assetPath} (unsupported extension ${assetPath.slice(assetPath.lastIndexOf("."))})`,
        )
      } finally {
        rmSync(unsupportedAssetPath)
      }
    },
  )

  it("deliberately excludes source PDFs from the manual asset inventory", () => {
    const sourcePdfPath = "public/manual/pwa-source-fixture.PDF"
    writeFileSync(sourcePdfPath, "excluded source")

    try {
      const inventory = getManualAssetInventory()

      expect(inventory.assetPaths).not.toContain("manual/pwa-source-fixture.PDF")
      expect(inventory.unsupportedPaths).not.toContain(sourcePdfPath)
    } finally {
      rmSync(sourcePdfPath)
    }
  })
})
