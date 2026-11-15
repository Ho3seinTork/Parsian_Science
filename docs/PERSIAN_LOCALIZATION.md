# Persian localization

New language preferences default to `fa-IR`. Existing explicit language choices,
including `system`, are preserved. `DEFAULT_LOCALE` remains English because it is
the source/fallback language used by i18next and its English plural resolver.
`fa`, `fa-IR`, and Persian language tags normalize to `fa-IR`.

## Delivered catalog

`src/shared/i18n/locales/fa-IR.json` contains 1,159 entries: 45 common, 142 native,
and 972 renderer entries. The inherited German reference has 45, 142 and 7,944
respectively. The common and native namespaces have full key coverage; renderer
translation is **partial**. Untranslated strings render the English source.
Technical names such as API protocols, model IDs and Notebook are preserved where
appropriate. These counts include plural/context entries, not unique screen labels.

The original eight complete catalogs retain their full coverage guards. Persian
has an explicit staged status and its own `persian.test.ts` integrity/runtime
suite, which verifies keys, interpolation markers, tag structure, plural forms,
native/renderer loading and English fallback. Missing Persian translations are not
filled with English strings to imply completion.

## Direction and typography

The document's `lang` updates with the active locale; the page itself stays `ltr`
so the window panes keep their places while the catalog is partial. Two layers make
the interface bilingual:

- `lib/bidi-director.ts` watches the rendered interface. Every region whose text is
  entirely Persian (ignoring code, digits and punctuation) gets `dir="rtl"` as a
  unit, so its text sits on the right and its icons and actions mirror. A region
  that still contains English keeps the left-to-right layout, and only its fully
  Persian parts are mirrored. Page-sized containers and elements whose component set
  a direction itself are never changed. Agent replies are directed as a whole by
  how they start.
- `assets/rtl.css` gives every text run its own direction and start-edge alignment
  (`unicode-bidi: plaintext`, `text-align: start`), so a Persian line inside a
  mixed region still reads right-to-left against the right edge and an English line
  left-to-right against the left edge. Code, terminal/editor elements, math,
  monospace content and selected technical fields are always LTR.

Font Arad is the interface face. A second face, `Arad Persian`, covers only the
Arabic-script range and leads the serif and monospace stacks, so Persian text in
headings and code-styled text also renders in Arad while Latin text keeps those
stacks' own faces. Font Arad is bundled with its OFL notice.

## Remaining acceptance work

- Translate and review the remaining renderer catalog and dynamically generated copy.
- Exercise desktop/web navigation, dialogs, long Persian strings, keyboard navigation,
  charts, tables and mixed technical text in a fully running application.
- Verify all target platforms, particularly Windows title-bar/tray behavior and macOS.
- Persian UI does not imply Persian OCR: the inherited OCR bundle has no Persian
  model. Persian currently uses its existing English OCR default; other installed
  OCR languages can still be selected.

This is initial language support, not a claim of complete Persian localization.
