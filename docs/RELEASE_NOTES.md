# Persian Science development changes — 2026-11-10

This is a source development milestone, not a packaged production release.

- Imported AIPOCH Open-Science history through commit
  `7621e9467cc523f40c7469ca561ea567a0d2cad7`, retaining Apache-2.0 attribution.
- Added Persian default-language selection, `fa-IR` normalization, RTL document and
  Radix direction, technical LTR isolation, and an initial 1,006-entry catalog.
- Applied supplied logo, Arad font and cobalt theme tokens to the existing UI.
- Changed application display identity and update destinations to Persian Science.
  No Persian Science binary release or update manifest is published yet.
- Added support for Persian release notes in the existing validated manifest format.
- Repaired two npm lockfile URLs to use the official registry without changing
  dependency versions or integrity hashes.
- Documented the source baseline, inherited functionality, actual limitations,
  licensing boundaries and Windows source setup.

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) and
[TESTING_AND_ACCEPTANCE.md](TESTING_AND_ACCEPTANCE.md) for scope and validation.
