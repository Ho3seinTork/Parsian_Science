# Persian Science requirements

Persian Science is an independent Persian-first distribution of Persian Science,
based on upstream commit `7621e9467cc523f40c7469ca561ea567a0d2cad7`.
The user requested development in `Ho3seinTork/Persian-Science`, with the supplied
logo and Arad font and a copy suitable for their Windows project directory.

## Preserve the application

Keep the existing navigation, panels, scientific viewers, notebooks, permission
boundaries, session formats and model adapters. Integrate changes through existing
owners and extension points. Retain upstream Apache-2.0 notices and attribution.
The upstream history and the `upstream` Git remote identify the implementation baseline.

## Persian interface and branding

- Persian (`fa-IR`) is the default for new language preferences. Existing explicit
  preferences remain respected; English remains the source fallback.
- Review Persian translations, preserve placeholders, and keep technical identifiers intact.
- Apply RTL to interface flow while preserving LTR for code, terminals, mathematics,
  URLs and model identifiers.
- Use the supplied logo unchanged and the Arad font. Replace existing theme tokens
  with the requested cobalt palette, without redesigning screens.
- Keep fork update destinations independent of upstream application releases.

## Research and models

Retain and verify existing local/custom model configuration, provider protocols,
specialists, reviewer routing, permission-aware tools, literature management,
notebooks, scientific viewers, compute-host integration and reproducibility exports.
Add capabilities only where the baseline audit establishes a gap.

The broader requested roadmap includes evidence-linked research, benchmarking,
workflow automation, optional scientific integrations and independent equivalents
of publicly documented research-assistant capabilities. A named feature or upstream
test file is not evidence of a verified integration. Track status and limitations
in [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

## Delivery and acceptance

Keep install/build/test commands reproducible; preserve lockfile integrity and
checksum verification. Record checks actually executed and environment blockers.
Deliver source to the user's GitHub repository and a source archive for local use.
The cloud agent cannot directly write to the user's Windows desktop.

Full acceptance requires a complete reviewed Persian catalog, tested RTL journeys,
working database/native runtime startup, and a real end-to-end research flow with
a configured model. Source import, static builds and unit tests alone do not meet
that full acceptance bar.
