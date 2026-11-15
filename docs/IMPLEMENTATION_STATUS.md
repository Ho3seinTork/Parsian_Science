# Implementation status — 2026-11-10

This is an initial source milestone of Persian Science, not completion of the
entire engineering brief or a production release.

| Area                       | Delivered state                                                                              | Validation / limitation                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Source baseline            | Full AIPOCH history imported through `7621e9467cc523f40c7469ca561ea567a0d2cad7`              | Upstream remote retained; original notices preserved                                                                                           |
| Persian preference and RTL | Default `fa-IR`, normalization, document direction, Radix direction, technical LTR isolation | Unit/render tests pass; Chromium startup confirms `fa-IR` + `rtl`                                                                              |
| Translation                | 45 common + 142 native + 972 renderer entries                                                | Common/native coverage complete; most of the 7,944-entry renderer reference remains untranslated                                               |
| Branding                   | Supplied logo, Arad font, cobalt tokens, application title and identity                      | UI build passes; platform installer appearance not verified                                                                                    |
| Updates                    | Fork-only release URLs; Persian manifest notes accepted                                      | Parser/service tests pass; no fork binaries or update manifest published                                                                       |
| Models and research tools  | Existing provider, specialist, literature and reproducibility implementations preserved      | Focused local suites pass; no live paid/local model or remote compute job claimed                                                              |
| Web bundle                 | Built successfully                                                                           | Static Chromium startup succeeds without JS exceptions; waits for missing backend                                                              |
| Complete runtime           | Incomplete installation in this environment                                                  | Prisma and pinned native components blocked by network policy                                                                                  |
| Types / whole suite        | Not passing/complete                                                                         | Generated Prisma Client unavailable; full `npm test` stops in pretest                                                                          |
| Extended roadmap           | Documented against existing owners                                                           | Full benchmark arena, workflow canvas, broader review board and optional external integrations remain planned                                  |
| Windows delivery           | Source archive and a Windows x64 preview release workflow                                    | Build and packaged installer/AppContainer checks gate publication; no completed installer upload has been verified from this cloud environment |

The npm package/internal CLI and storage/protocol identifiers retain their upstream
names where they are compatibility contracts. Some inherited untranslated copy
and ancillary assets still use upstream branding. Optional proprietary runtimes
in the inherited dependency tree are not reclassified as open source; see
[THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Next runtime prerequisite

Allow `binaries.prisma.sh` and `statics.aipoch.com` in the cloud environment's
outbound policy, then rerun `npm ci`, type checks, the full suite and actual
application startup. Both domains returned proxy HTTP 403 during this work.
TLS, artifact hashes, patches and checksum verification remain enabled.
The environment draft API could not verify the current draft, so no network
configuration change is claimed as saved or applied.

## Windows preview publication

`.github/workflows/persian-windows-release.yml` runs on
`persian-preview-YYYY.MM.DD` tags on main (with an optional `.N` suffix for another
attempt). It reuses the existing Build workflow with all verification enabled,
selects Windows x64 packaging, and then runs the existing Package Smoke workflow
on the exact installer artifact, including packaged AppContainer certification.
The unsigned preview uses the existing `1.1.0-nightly.g<commit>` version format.

Only successful verification permits the publisher to upload the `.exe`, its
blockmap and SHA-256 checksums. It creates a draft first and publishes it as a
prerelease after upload; it does not replace stable update metadata or overwrite
an existing release. A failed upload can leave a draft for inspection.

The installer smoke now checks Persian Science's filename, bootstrap identity
and NSIS registration, while the internal executable remains `open-science.exe`.
The Linux desktop ID also retains `open-science.desktop` to match that platform's
installed launcher. The supplied PNG remains the packaging icon.

Git transport is available, but `api.github.com` still returns proxy HTTP 403.
Pushing a workflow/tag is not evidence that a Windows runner succeeded or that
an installer appeared in Releases. Check the workflow run and release assets
before treating the Windows build as delivered.

After runtime startup is available, test the real project → conversation →
tool/notebook → artifact → export path using an explicitly configured model.
Then complete/review the Persian catalog and remaining product capabilities.
