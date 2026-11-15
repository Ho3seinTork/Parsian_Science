# Source, assets and third-party license notes

This is a scoped provenance inventory for the Persian Science fork. It is not a complete dependency SBOM or a legal compatibility determination for every upstream transitive dependency.

## Application source

The imported source is AIPOCH Open-Science, commit `7621e9467cc523f40c7469ca561ea567a0d2cad7`, from <https://github.com/AIPOCH/Open-Science>. The root `LICENSE` is Apache License 2.0. Preserve it, original author attribution, applicable notices, and the upstream history. New branding does not transfer authorship of inherited code.

The local package manifests inspected overwhelmingly declare Apache-2.0; `packages/safe-file-publisher-native/package.json` does not independently declare a license field. Do not infer that every separately downloaded dependency, runtime, model or dataset has the application's root license.

## Supplied assets

- Logo: user-supplied `logo.png` from the uploaded «هارنس ساینس» archive. It is used as supplied; no third-party logo license or broader ownership verification is asserted here.
- Arad: user-supplied font archive. Embedded metadata identifies “Copyright 2024 The Arad Project Authors”, author Mohammad Darvishi, <https://github.com/MDarvishi5124/Arad>, and SIL Open Font License 1.1. The selected web font is `src/renderer/src/assets/fonts/Arad-VF.woff2`. Preserve the matching OFL notice beside the bundled font and do not relicense the font under Apache-2.0.
- Other inherited assets retain their adjacent notices, including `packages/pdf-translation/resources/OFL.txt` and `docs/images/readme/benchmark-comparisons.LICENSE.txt`.

## Optional runtimes are not all open source

The inherited dependency tree includes `@anthropic-ai/claude-agent-sdk` and platform packages. The installed `@anthropic-ai/claude-agent-sdk-linux-x64/LICENSE.md` states “© Anthropic PBC. All rights reserved” and points to <https://code.claude.com/docs/en/legal-and-compliance>. The lockfile labels related licenses with `SEE LICENSE ...`, not Apache-2.0.

Therefore, “Apache-licensed application source with selectable backends” must not be rewritten as “every bundled runtime is open source.” Audit the actual distribution terms before redistributing optional proprietary runtimes. The application's custom/local provider support is a separate fact and does not waive third-party terms or authentication requirements.

## Scientific services and candidate integrations

Built-in API connector source does not grant unrestricted rights to the publications, datasets, structures or model weights returned by the remote service. Each API's authentication, rate limits and content reuse terms still apply. Full-text availability is not proof of permission to redistribute it.

The brief names ToolUniverse, Biomni, PaperQA2, GPT Researcher, AI-Scientist-v2, Denario, Docling, Quarto, MLflow, Langfuse and other projects. No new code from these projects has been imported in this milestone. Their names are an evaluation backlog, not completed integrations or verified license findings. Inspect an exact candidate revision and all relevant code/data/model licenses before incorporating it.

## Distribution follow-up

Before a release, produce a dependency/version/license inventory from the exact packaged lockfile and bundled binaries, carry required attribution/license texts, review native/runtime redistribution terms, and document any source-code or notice obligations. Keep downloaded model weights and credentials out of the source bundle unless their inclusion is separately authorized and licensed.
