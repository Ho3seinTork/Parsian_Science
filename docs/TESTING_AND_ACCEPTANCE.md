# Validation evidence — 2026-11-10

These checks describe this Linux cloud checkout. They do not certify Windows or
macOS packages, a live model provider, or the complete project brief.

## Passed checks

- `npm run build:packages`: shared packages build successfully.
- `npm run build:web`: final renderer bundle builds successfully. Existing large
  chunk and third-party annotation warnings remain; they are not runtime proofs.
- Focused behavior run: **64 files / 1,206 tests passed**. Command:

  ```sh
  npx vitest run src/shared/settings.test.ts src/shared/locale.test.ts src/shared/local-models.test.ts src/shared/update.test.ts src/main/tray.test.ts src/main/app-branding.test.ts src/main/update/manifest.test.ts src/main/update/service.test.ts src/renderer/src/lib/locale-preference.test.ts src/renderer/src/components/InterfaceDirection.test.tsx src/renderer/src/components/OpenScienceLogoLoader.test.tsx src/renderer/src/i18n/persian.test.ts packages/providers packages/reproducibility packages/literature-citations packages/specialists --maxWorkers=2
  ```

- Catalog/interface/brand run: **8 files / 832 tests passed**, including
  `src/renderer/src/i18n/resources.test.ts` (the complete inherited catalogs),
  `persian.test.ts`, locale/preferences/direction, local-model defaults and branding.
  This run overlaps the behavior run; their counts must not be added together.
- Chromium loaded the built web bundle from a temporary local static server:
  title `Persian Science Remote`, document language `fa-IR`, direction `rtl`, and
  no JavaScript page errors. The page displayed reconnecting status because no
  backend was running. This verifies startup assets/direction, **not** a functioning
  research session or persistence.
- A separate Chromium check loaded the built application stylesheet explicitly:
  the Arad font face loaded and a technical `pre` element remained LTR inside the
  RTL document. The reconnecting shell does not load the full application CSS
  until backend initialization, so this check is a stylesheet fixture.
- Locale persistence/recovery consumers: **3 files / 26 tests passed**, using
  `src/main/locale/owner.test.ts`, `src/renderer/src/stores/locale-store.test.ts`, and
  `src/renderer/src/stores/locale-preference-recovery.render.test.tsx`. Expectations
  for absent/invalid preferences now assert the requested Persian default while
  explicit `system` preferences still resolve the host language.

## Blocked and failed checks

- `npm ci` installed npm dependencies and verified repository patches, but its
  postinstall stopped at the Prisma engine/checksum download: proxy HTTP 403 from
  `binaries.prisma.sh`. Two earlier mirror URLs were repaired to official npm
  URLs with unchanged versions/integrity hashes.
- Electron installation subsequently succeeded with
  `NODE_USE_ENV_PROXY=1 ./node_modules/.bin/install-electron`, using inherited proxy
  settings and normal verification.
- `npm run build:backend:compiled` stopped while staging pinned native components
  from `statics.aipoch.com`: proxy HTTP 403.
- `npm run typecheck` failed with missing generated Prisma types and related
  downstream errors. No full typecheck pass is claimed. The earlier renderer
  typecheck was also affected because its type graph includes backend contracts.
- `npm test` stopped in pretest because Prisma Client was not generated. It did
  not execute the complete suite; the focused `npx vitest` runs above exercise
  paths that can run with the available dependencies.
- Full application startup, desktop E2E, Windows/macOS packaging and remote
  scientific services remain unverified. No credentials were requested or invented.

## CI registration

The initial registration run detected the new font missing from ownership,
catalog test inventory changes, and reviewed dependency boundaries needing
reclassification. The font is now registered, the new Persian test is retained,
and affected modules conservatively require full validation through
`fullTestReason`. Existing CI boundary policy and assertions were not disabled.
The locale inventory test now verifies that full-validation requirement and the
expanded test set. The generated-consumer command was executed after staging.

Final `npx vitest run --config scripts/ci/vitest.registration.config.ts`:
**8 files / 1,674 tests passed**. These are ownership/routing/integrity tests, not
scientific feature tests; their counts are separate from behavior coverage.

`npm run lint` completed with **0 errors** and one formatting warning in the
release-note locale list. The formatting was corrected; a fresh lint of the
changed consumers is used to avoid an old cached diagnostic from the earlier run.
That fresh check completed with no errors or warnings. The font's OFL notice was
then added to the asset ownership inventory and the final ownership audit was
rechecked with no missing files.

The source is a development checkpoint. Full type validation, application E2E,
platform packaging and independent release review remain outstanding.

## Windows release preparation

The new preview workflow passed `actionlint` 1.7.7 and changed-file formatting
checks. Its release contract retains full Build verification and packaged
Windows installer/AppContainer checks before the write-enabled publisher.
That publisher downloads the tested artifact, verifies the expected filename,
checksums the installer and blockmap, and publishes a prerelease after uploading
to a draft. It does not execute repository source with release write access.

The focused release/packaging run used:

```sh
npx vitest run scripts/windows-installer-smoke.test.ts scripts/ci/release-workflows.test.ts scripts/electron-builder-config.test.ts scripts/windows-release-workflows.test.ts --maxWorkers=2
```

Result: **186 passed, 2 failed, 4 platform-specific skips** across four files.
Both remaining failures require the unavailable generated Prisma Client for
database migration tests. The release topology, packaging configuration and
Windows workflow files passed. The installer filename/bootstrap checks and
NSIS registry-identity checks passed as well. No failed test was disabled.

`npm test` was retried and still stops at its Prisma pretest. `npm run typecheck`
was retried and still fails on unavailable Prisma types. These local limitations
are not waived in the release workflow: GitHub Actions must pass its checks
before any installer becomes public. Windows execution and final release upload
have not been observed from this environment.
