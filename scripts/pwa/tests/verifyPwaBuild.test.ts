import { rmSync, writeFileSync } from "node:fs"
import { expect, test } from "vitest"
import { verifyPwaBuild } from "../verifyPwaBuild.ts"

test("rejects unsupported manual files while deliberately excluding source PDFs", () => {
  const unsupportedAssetPath = "public/manual/pwa-unsupported-fixture.tif"
  const sourcePdfPath = "public/manual/pwa-source-fixture.pdf"
  writeFileSync(unsupportedAssetPath, "unsupported")
  writeFileSync(sourcePdfPath, "excluded source")

  try {
    let verificationError: unknown
    try {
      verifyPwaBuild()
    } catch (error) {
      verificationError = error
    }

    expect(verificationError).toBeInstanceOf(Error)
    expect((verificationError as Error).message).toContain(
      "unsupported manual asset extensions: manual/pwa-unsupported-fixture.tif",
    )
    expect((verificationError as Error).message).not.toContain("pwa-source-fixture.pdf")
  } finally {
    rmSync(unsupportedAssetPath)
    rmSync(sourcePdfPath)
  }
})
