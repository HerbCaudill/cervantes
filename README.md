# Boletín CCSE

Boletín CCSE is an offline-capable React application for practicing the official
2026 CCSE question bank and reading the complete preparation manual. Practice
history and reading progress stay in the browser; the application has no
server-side user data.

## Development

```bash
pnpm install
pnpm dev
```

Use `pnpm test:all` for the complete unit, browser, and installed-PWA suite.
`pnpm build` also verifies that every manual figure and application asset is
included in the generated service worker.

## Maintenance boundaries

The practice and reader features deliberately share the application shell but
not their content or persistence:

| Area                                       | Owns                                                                                                                | Must not own                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `src/data`, `src/lib`, `src/hooks`         | Question-bank parsing, scheduling, and flashcard state                                                              | Manual content, routes, or reading progress                |
| `src/manual`                               | Manual schema, validated structured content, semantic topic routes, visible-block projection, and local search data | React presentation or browser persistence                  |
| `src/components/Manual*`                   | Reader composition and semantic rendering of manual blocks                                                          | Source extraction, content correction, or progress storage |
| `src/reader`                               | Versioned local reading state, progress calculations, saving, and scroll restoration                                | Flashcard state or manual source content                   |
| `src/navigation`                           | Application route parsing and browser-history navigation                                                            | Feature-specific content or state                          |
| `scripts/ccse-manual-import`               | Reproducible PDF extraction and figure generation                                                                   | Runtime reader behavior                                    |
| `public/manual`                            | Offline figure assets referenced by the manual manifest                                                             | Unreferenced or remotely hosted reader assets              |
| `vite.config.ts`, `scripts/pwa`, `e2e/pwa` | Service-worker policy, build inventory checks, and installed-PWA verification                                       | Feature state migrations                                   |

Stable question IDs and manual topic IDs are persistence keys. Do not rename or
reuse them after release. Details of the manual model and reader storage schema
live in [`src/manual/README.md`](src/manual/README.md) and
[`src/reader/README.md`](src/reader/README.md).

## Private deployment

The complete manual and its figures are copyrighted source material, so the
production project must not have a publicly accessible domain. The linked
Vercel project uses Vercel Authentication with Standard Protection and has no
custom project domains attached. Its generated production, branch, and
deployment URLs therefore require an authorized Vercel session.

Do not attach a custom domain under the current protection scope: Vercel
explicitly excludes custom production domains from Standard Protection. A
custom domain is safe only after the project has hosting-level protection for
all deployments. After any hosting change, verify that an unauthenticated
request to every active alias redirects to Vercel SSO rather than returning the
application.

Deployments are created from pushes to `main`. The protected stable origin is:

```text
https://cervantes-herb-caudills-projects.vercel.app
```

Keep that origin stable for installed PWAs because `localStorage`, the service
worker, and its caches are origin-scoped. The update scenario in
`e2e/pwa/offline-reader.spec.ts` installs the production build, activates a
changed service worker, reloads offline, and proves that both
`ccse-flashcards:states` and `cervantes:manual-reader:v1` survive the update.
