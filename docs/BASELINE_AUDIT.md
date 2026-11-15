# Persian Science baseline audit

Audit date: 2026-11-09. This is an inspection of the imported source, not a claim that every inherited feature has been exercised in this environment.

## Source and preservation

- Upstream: <https://github.com/AIPOCH/Open-Science>.
- Imported commit: `7621e9467cc523f40c7469ca561ea567a0d2cad7` (`fix(compute): clean up staged resources for unlaunched jobs (#4202)`).
- Upstream package version: `1.1.0`; application source license: Apache-2.0 (`LICENSE`).
- Destination: <https://github.com/Ho3seinTork/Persian-Science>. Importing history into an existing repository does not establish GitHub's platform-level fork relationship.
- The supplied archive contained `logo.png` and `Arad-fonts.zip`; it did not contain a separate source snapshot. The user explicitly authorized obtaining the upstream code from GitHub.
- Original author attribution, license, package boundaries, application routes, persistence formats, and scientific viewers are retained. Internal `open-science` identifiers can remain where they are compatibility contracts.

## Existing screen structure

The existing React application is the implementation baseline. Its main surfaces are `src/renderer/src/pages/home/HomePage.tsx`, `pages/workspace/WorkspacePage.tsx`, `pages/literature/LiteratureLibraryPage.tsx`, and `pages/settings/SettingsPage.tsx`. Workspace owns the conversation, notebook, files, preview panels, plans, and artifact/reproducibility surfaces. Settings already contains provider, model-routing, agent, connector, runtime, and compute configuration. These are reused rather than replaced by a new dashboard.

`docs/design.md` and the upstream images in `docs/images/readme/` document the original design. Those images are upstream reference assets, not screenshots captured during this audit. A fresh native desktop screenshot comparison remains a separate validation step.

## Evidence and status

| Capability | Evidence in the imported tree | Baseline status |
| --- | --- | --- |
| Desktop and web application | `electron.vite.config.ts`, `vite.web.config.ts`, `src/main/web-service/`, `src/preload/` | Implemented in source; full startup requires dependencies and native/runtime assets |
| Projects, persistent sessions, branching and exchange | `src/main/session-persistence/`, `src/main/session-package/`, `src/shared/session-package.ts` | Present in code; no end-to-end persistence/export claim from source inspection |
| Custom/local model configuration | `src/shared/settings.ts`, `src/renderer/src/pages/settings/ProviderForm.tsx`, `provider-form-value.ts` | Existing implementation includes Ollama/LM Studio/llama.cpp/vLLM presets; live model service not exercised by this audit |
| Agent, subagent and reviewer routing | `src/shared/settings.ts`, `src/main/delegation/`, `src/main/reviewer/model-runtime-owner.ts` | Present; independent model policies exist, not all requested research roles are individually implemented |
| Literature and scientific connectors | `packages/connector-builtins/src/`, `packages/literature-library/`, `packages/literature-reading/` | Present; remote services, current API availability and credential-dependent paths unverified |
| Python/R/shell execution | `src/main/notebook/kernel-executor.ts`, `execution-owner.ts`, `packages/environment/` | Present; platform/runtime execution must be tested on the actual target |
| Compute jobs and remote hosts | `packages/compute/src/ssh-runner.ts`, `slurm-driver.ts`, `kubernetes-backend.ts`, `ray-job-control.ts` | Present; remote infrastructure and permissions required |
| Artifact provenance and reruns | `src/main/artifacts/provenance-repository.ts`, `artifact-provenance-graph.ts`, `packages/reproducibility/` | Present; captured evidence and a successful replay do not prove scientific validity |
| Scientific reviewer | `src/main/reviewer/orchestrator.ts`, `rubric.ts`, `scope.ts`, `mcp-server.ts` | Present; scope-limited evidence review, not an already complete multi-role Scientific Review Board |
| Research package export | `src/main/session-package/ro-crate.ts`, `src/main/artifacts/ro-crate-export.ts` | Present; only captured records are exported, not an arbitrary full machine image |
| Persian language, font, identity and RTL | Existing i18next supports other locales; Persian changes are tracked separately | Missing at imported commit; fork implementation is incremental |
| General experiment arena / editable workflow canvas | Reviewer evaluation scripts and plans exist | Full requested products not established; planned gaps, not completed integrations |

## Installation and checks

The documented toolchain is Node.js 24 with npm (`.nvmrc`, `docs/development-quick-reference.md`). Root scripts cover shared packages, backend, renderer, type checks, Vitest and Playwright. The initial install failed fetching two lockfile URLs hosted by `registry.npmmirror.com` under this environment's network policy. Their URLs were changed to the official npm registry while preserving versions and integrity hashes; this is an installation repair, not a dependency upgrade.

The audit itself does not mark inherited tests as passing merely because test files exist. Consult `IMPLEMENTATION_STATUS.md` and the delivered validation report for executed commands and results. Current environment limitations must be distinguished from repository regressions. Remote provider credentials, GPU/SSH/SLURM services, Windows/macOS packaging and complete scientific journeys need their own runtime evidence.

## Remaining product gaps

The broad project brief exceeds a branding/localization change. The complete Persian catalog, extended model metadata and capability probes, research/evidence graph beyond artifact provenance, general benchmark arena, multi-role review board and editable workflow canvas need further implementation and acceptance tests. Optional external repositories have not been incorporated merely because they are named in the brief. See `FEATURE_INTEGRATION_MATRIX.md` and `MODEL_PROVIDER_SPEC.md`.
