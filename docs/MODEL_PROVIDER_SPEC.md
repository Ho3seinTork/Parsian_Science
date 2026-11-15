# Model provider implementation and remaining scope

This document maps the requested Model Hub to the implementation inherited from AIPOCH. It is a description of current contracts, not a promise that every model works or every requested capability is implemented.

## Existing configuration

`src/shared/settings.ts` defines `ProviderDraft`, `ProviderView`, model protocols, validation results, and routing. The existing Settings UI (`ProviderForm.tsx`, `ProvidersPanel.tsx`, `ModelPanel.tsx`, `ScenarioModelList.tsx`) is the integration surface.

| User setting | Current contract |
| --- | --- |
| Display name and model ID | `name`, `model` |
| Endpoint and protocol | `baseUrl`, `apiEndpoints`: Messages, Chat Completions or Responses |
| Credentials | `key` accepted by the main-owned write path; masked fields in `ProviderView` |
| Token limits | `contextWindow`, `maxInputTokens`, `maxOutputTokens` |
| Image input | `supportsImageInput` declaration |
| Reasoning | `reasoningEffortPreset`, `reasoningEffortTransport` |
| Official vendor/region | `vendorId`, `region`, provider registry in `packages/providers/src/providers/` |
| Connection result | `lastValidatedAt`, `lastValidatedTarget`, `lastValidationFailure` |
| Reviewer and subagent assignment | Separate `ReviewerModelConfiguration` / `SubagentModelConfiguration`, each `inherit` or `fixed` provider/model/reasoning selection |

Credentials are not returned as plaintext in the renderer-facing provider view. See `src/main/settings/crypto.ts` and `provider-privacy.test.ts`; platform credential modes are described in `SECURITY_AND_PRIVACY.md`.

## Local and self-hosted models

`src/renderer/src/pages/settings/provider-form-value.ts` defines these existing presets:

| Runtime | Preset base URL | Preset protocol |
| --- | --- | --- |
| Ollama | `http://localhost:11434` | Chat Completions |
| LM Studio | `http://localhost:1234` | Chat Completions |
| llama.cpp | `http://localhost:8080` | Chat Completions |
| vLLM | `http://localhost:8000` | Chat Completions |

The model identifier is entered manually; the app does not assume which weights are installed. Presets fill editable values and do not install or start the model server. The server must be reachable from the machine running the backend: `localhost` in a cloud environment does not refer to the user's Windows computer.

Use Settings → Models/providers → custom provider, choose the appropriate preset or base URL, enter the exact installed model ID and supported API protocol, then run the existing validation action. Configure a compatible agent runtime. An API that responds successfully to text may still lack the tool-calling or image behavior that the selected workflow needs.

`src/shared/provider-url-policy.ts` and `packages/providers/src/transport/url-security.ts` require HTTPS for remote endpoints. HTTP is permitted for loopback (`localhost`, `127.*`, `[::1]`), where an API key is optional. Remote custom gateways require a key. Do not bypass these controls to connect an insecure LAN endpoint; use an appropriate HTTPS gateway or an authorized local tunnel.

## Transport and routing

`packages/providers/` implements protocol adapters and streaming parsing. `src/main/settings/provider-transport-owner.ts` owns app transport; `provider-runtime-projection.ts` supplies runtime-compatible configuration. Framework compatibility must be checked for the configured protocol. Existing protocol bridges do not imply native support for every server feature.

Reviewer and subagent settings can inherit the active target or choose a fixed provider/model/effort. This is distinct from automatic routing by privacy, monetary cost and capability. The brief's full role catalog (statistician, domain reviewer, planner, etc.) is not automatically implemented by the existence of a generic specialist or fixed model assignment.

## Explicit gaps in the broad brief

The current `ProviderDraft` does not expose a complete schema for user-configured headers, timeout/retry policy, sampling parameters, per-model token pricing, audio, embeddings, privacy classification or fallback chains. Transport code may internally handle a subset of those values; that is not an editable, persisted and validated Model Hub feature.

Likewise, a connection/target-validation result must not be labelled proof of streaming, structured output, tool calling and vision simultaneously. A complete verified/declared/unsupported/untested capability matrix needs separate probes and stored results for each capability. A model's name or preset is not evidence.

Next changes should extend the existing settings and transport owners with versioned, narrowly scoped fields and functional tests, rather than adding a parallel provider subsystem. Sensitive prompts must not be silently retried against a different remote provider.

## Validation references

Existing targeted suites include `packages/providers/src/`, `src/main/settings/provider-protocol-regressions.test.ts`, `src/main/settings/provider-loopback-http-host.test.ts`, `src/main/settings/provider-privacy.test.ts`, and `src/renderer/src/pages/settings/provider-form-value.test.ts`. Passing mocked protocol tests does not establish live model quality, server availability or credentials. Actual executed checks are recorded in `IMPLEMENTATION_STATUS.md`.
