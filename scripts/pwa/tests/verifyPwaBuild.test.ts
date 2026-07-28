import { rmSync, writeFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { verifyPwaBuild } from "../verifyPwaBuild.ts"

describe("verifyPwaBuild", () => {
  it("accepts every currently supported manual figure", () => {
    expect(() => verifyPwaBuild()).not.toThrow()
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
      expect(() => verifyPwaBuild()).not.toThrow(/pwa-source-fixture\.PDF/)
    } finally {
      rmSync(sourcePdfPath)
    }
  })
})
