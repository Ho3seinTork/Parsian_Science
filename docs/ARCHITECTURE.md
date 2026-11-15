# Persian Science architecture

Persian Science extends the imported Persian Science architecture. This document describes existing ownership boundaries; it does not propose a replacement application framework. The authoritative detailed upstream account remains `PRD.md`, section 8.

## Application boundaries

| Layer                        | Existing owner                                                                                           | Responsibility                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Renderer                     | `src/renderer/src/`                                                                                      | React pages, scientific viewers, forms, component library and client stores                   |
| Desktop bridge               | `src/preload/`, `src/shared/renderer-contracts/`                                                         | Typed application commands and events between UI and backend                                  |
| Host/runtime                 | `src/main/`, `src/main/web-service/`                                                                     | Desktop host integration, ordinary Node business services, web delivery and lifecycle         |
| Persistence                  | `prisma/schema.prisma`, `src/main/database/`, `src/main/session-persistence/`                            | Database schema/migrations and durable session state                                          |
| Settings and model selection | `src/main/settings/`, `src/shared/settings.ts`                                                           | Provider records, credentials, runtime readiness and per-scenario routing                     |
| Provider transport           | `packages/providers/`                                                                                    | Messages, Chat Completions and Responses protocols, streaming and request/response conversion |
| Agents                       | `src/main/acp/`, `src/main/agent-framework/`, `src/main/delegation/`, `packages/agent-harness/`          | Agent sessions, handoffs, delegated tasks and permission boundaries                           |
| Scientific tools             | `packages/connector-core/`, `packages/connector-builtins/`, `packages/connector-mcp-client/`             | Built-in scientific APIs, tool contracts and external MCP integrations                        |
| Execution                    | `src/main/notebook/`, `packages/environment/`, `packages/notebook-network-sandbox/`, `packages/compute/` | Kernel lifecycle, environments, protected execution and remote compute jobs                   |
| Artifacts and evidence       | `src/main/artifacts/`, `packages/reproducibility/`, `src/main/session-package/`                          | Immutable versions, lineage, replay/comparison evidence and portable exports                  |
| Review                       | `src/main/reviewer/`                                                                                     | Bounded turn/artifact review, findings, evidence reads and correction lifecycle               |

## Existing UI preserved

Home, workspace, literature, settings and existing panels remain the user-facing entry points. Branding changes should replace the existing name/logo/theme values. Locale changes use `src/shared/locale.ts`, `src/shared/i18n/` and the existing main/renderer adapters. Persian is an interface preference; English remains the source language and fallback for untranslated strings. Technical content needs explicit LTR isolation within RTL surfaces.

Do not replace provider forms, notebook editors, menus or viewers to obtain a simpler initial implementation. Extend their current owners and keep the existing command/event contracts. New workflow or benchmark functionality needs a separately tested integration at these boundaries.

## Data and execution limits

Persistent conversation state is distinct from the in-memory execution state of Python/R/shell kernels. A restart does not justify silently replaying earlier commands. Artifact exports record available source, inputs, outputs, configuration and environment evidence; they cannot reconstruct evidence that was never captured. Platform-dependent sandboxing, credentials and native runtime behavior require platform-specific verification.

External provider calls, downloaded components and remote compute are optional configured services. Local storage does not mean all model/tool traffic is local. See `SECURITY_AND_PRIVACY.md` for the current controls and limits.
