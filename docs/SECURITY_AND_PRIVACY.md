# Security and privacy boundaries

Persian Science preserves the source application's security ownership. This is an implementation inventory and set of operational limits, not a security certification. The upstream vulnerability-reporting policy remains in `../SECURITY.md`.

## Credentials

`src/main/secure-storage.ts`, `src/main/credential-identity/` and `src/main/settings/crypto.ts` own the host-selected credential cipher. The default is OS-backed storage. Unavailable secure storage fails new OS-backed credential writes; Linux `basic_text` is not treated as secure encryption. The renderer receives masked provider views (`src/shared/settings.ts`), not the stored plaintext key.

There is an explicit inherited exception: `--credential-store=file` is accepted only by the Linux headless backend (`src/main/settings/credential-store-mode.ts`). Its `file:v1:` references are reversible base64 in private configuration documents, **not encryption**. Do not describe this mode as an OS vault, enable it silently, or export its configuration as a secret-free backup. Existing legacy credential references have compatibility read paths.

User data directories, settings, credential profiles and diagnostic logs are not source assets and must not enter Git commits or distributable project ZIP files. A source dependency or remote model key must never be copied into installation instructions.

## Provider and network boundaries

`packages/providers/src/transport/url-security.ts` permits remote HTTPS and loopback HTTP. `src/shared/provider-url-policy.ts` rejects credentials in provider URLs and rejects query strings/fragments. Model provider settings must use the credential field and the selected protocol. Connector authentication belongs to `src/main/connectors/`, `src/main/settings/device-credentials.ts` and `packages/connector-mcp-client/`.

The application can be used with a local model server, but local project storage is not a guarantee of offline operation. Configured remote models, scientific databases, package downloads and compute services transmit requests to their destinations. The current source does not establish a complete dataset privacy-classification system or an automatic privacy-aware model fallback policy. Do not claim those requested controls are complete. Medical or confidential datasets require the user's actual authorization and deployment safeguards before remote transmission.

## Code and tools

Notebook execution and environment management are owned by `src/main/notebook/` and `packages/environment/`. The platform-specific filesystem/network protection package is `packages/notebook-network-sandbox/`, with Linux, macOS and Windows implementations. Their presence does not prove protection on a machine where the required native runtime is unavailable or protection is disabled. Check the actual execution mode and readiness before making an isolation claim.

Agent permissions, delegated-work boundaries and approval lifecycles remain in the current ACP/delegation owners; remote compute remains in `packages/compute/`. Keep approval gates for destructive actions and costly remote jobs. A general-purpose coding agent can execute powerful tools under its selected permission mode, so this fork must not be described as universally sandboxed regardless of configuration.

## Evidence, review and exports

`src/main/reviewer/scope.ts` and `mcp-server.ts` limit reviewer evidence access. `rubric.ts` explicitly distinguishes tracing recorded evidence from recomputation. Review output remains evidence for human assessment, not proof that a scientific conclusion is valid.

Immutable artifact records and reproducibility projections retain available provenance. `.science` and RO-Crate exports have explicit sensitive-content and selection handling (`src/main/session-package/sensitive-content.ts`, `selection.ts`, `ro-crate.ts`). Review selected exports before sharing; no general guarantee can cover secrets embedded by users inside arbitrary source data or document text.

## Validation still needed

Run the relevant credential/privacy, URL-policy, permission, sandbox and export tests after changes to their owners. Validate the actual OS and runtime in use; Linux tests cannot certify Windows or macOS packaging, keychain access or sandbox behavior. This branding/localization milestone does not constitute penetration testing, dependency-wide vulnerability review, medical data compliance or institutional access-control certification.
