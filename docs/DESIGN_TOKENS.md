# Persian Science design tokens

The existing component hierarchy and surfaces are retained. Brand tokens live in
`src/renderer/src/assets/main.css`:

| Token                    | Value     |
| ------------------------ | --------- |
| `--brand-deep-cobalt`    | `#0D49AB` |
| `--brand-royal-blue`     | `#0D4EB6` |
| `--brand-electric-blue`  | `#2469D1` |
| `--brand-azure-blue`     | `#3E7BD8` |
| `--brand-muted-blue`     | `#78A0DB` |
| `--brand-powder-blue`    | `#A3BADA` |
| `--brand-pale-blue`      | `#C1CCE2` |
| `--brand-cool-blue-gray` | `#CED5E5` |
| `--brand-white`          | `#FFFFFF` |

Neutral surfaces carry the brand hue as well as the accents. Light theme: cool
blue-tinted whites (`--bg-10` `hsl(218 56% 97%)`, white cards, `#cdd7ea` borders),
deep cobalt primary with white text and electric-blue focus rings. Dark theme:
near-black cobalt surfaces (`--bg-10` `hsl(222 42% 4%)`, `#0f1522` cards, `#1f2940`
borders), muted-blue primary with dark text, a deep-blue accent and azure focus
rings. The markdown palette in `agent-markdown.css`, the find overlay and the web
connection screen use the same values; links are cobalt instead of the inherited
orange and informational status is blue. Destructive, success and warning colors
and chart semantics remain intact. The supplied logo is cut with rounded corners
(22.5% radius) in every app, tray and installer icon. No new dashboard or decorative section
was introduced.

The supplied logo is used unchanged in existing image slots, favicon, startup
loader and packaging icon inputs. Its gradient remains an image with its original
left-to-right composition, independent of interface direction. Arad variable WOFF2
is used for interface typography; scientific/code fonts keep their existing roles.
The loader retains its timing, reduced-motion handling, DPR limit and cleanup,
while drawing the supplied artwork. Platform installers/icons require separate
packaging validation and have not been released.
