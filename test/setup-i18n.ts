// Pins the interface language to English for every test.
//
// Deliberately explicit rather than letting the renderer's detection run: jsdom reports 'en-US' by
// default, which would resolve to English anyway, but a CI runner or developer machine with a Chinese
// system language would flip every render assertion in the suite. Pinning here keeps the existing
// English expectations meaningful and makes a locale-dependent test opt in by switching the language
// itself.

import { initI18n, prepareI18nLocale } from '../src/renderer/src/i18n'

// Existing render suites switch synchronously; cold-loading behavior has a separate reset-module suite.
import { LOCALES } from '../src/shared/locale'
await Promise.all(LOCALES.map(prepareI18nLocale))
initI18n('en')

// The product defaults to Persian when nothing is stored. Pin the stored preference as well, so the
// locale store (number and date formatting) agrees with the English catalog selected above.
if (typeof window !== 'undefined') {
  try {
    window.localStorage.setItem('open-science-language', 'en')
  } catch {
    // Storage is unavailable in this environment; the affected suites select a locale themselves.
  }
}
