# Research capability comparison status

This document does **not** assert complete Claude Science parity. The supplied
project brief lists desired capabilities; it is not independently verified product
documentation. No proprietary implementation, prompts or private skill bundles
were imported.

| Requested capability | Existing implementation to inspect | Current evidence |
| --- | --- | --- |
| Persistent research projects and sessions | `src/main/projects/`, `src/main/composition/session-projection.ts`, session persistence owners | Source inventory; see baseline audit |
| Research planning and approvals | `src/main/session-plan/`, existing permission controls | Source inventory; live workflow pending |
| Literature search, references and citations | `packages/literature-*`, existing connector packages | Source inventory; external access/model-dependent |
| Scientific code and notebooks | `src/main/notebook/`, notebook packages | Existing implementation; native runtime validation pending |
| Custom/local models and specialist routing | `packages/providers/`, `src/shared/settings.ts` | Existing adapters; focused test results recorded separately |
| Reviewer and reproducibility | Existing reviewer and `packages/reproducibility/` owners | Source inventory; no claim of newly implemented parity |
| General workflow editor and broad benchmark UI | No complete equivalent established by this audit | Planned; requires a concrete scoped implementation |

Before claiming parity for a capability, record an official public source URL and
retrieval date, map its behavior to a concrete implementation, define acceptance
cases, and execute them. External tools and model credentials must be identified.
Use [FEATURE_INTEGRATION_MATRIX.md](FEATURE_INTEGRATION_MATRIX.md) for the
source-backed inventory and [TESTING_AND_ACCEPTANCE.md](TESTING_AND_ACCEPTANCE.md)
for executed validation. Optional external projects have not been vendored merely
because they were listed in the brief.
