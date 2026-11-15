// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  applyHtmlLang,
  getStoredPreference,
  LANGUAGE_STORAGE_KEY,
  persistPreference,
  resolveInitialLocale,
  resolvePreference,
  systemLanguageTags
} from './locale-preference'

// navigator.languages is a read-only accessor in jsdom, so stub it per test.
const stubLanguages = (languages: string[] | undefined, language = 'en-US'): void => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages as readonly string[])
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(language)
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('systemLanguageTags', () => {
  it('returns the full prioritized list when present', () => {
    stubLanguages(['zh-TW', 'zh', 'en'])
    expect(systemLanguageTags()).toEqual(['zh-TW', 'zh', 'en'])
  })

  it('falls back to the single navigator.language when the list is unavailable', () => {
    stubLanguages(undefined, 'zh-CN')
    expect(systemLanguageTags()).toEqual(['zh-CN'])
  })

  it('falls back to the single language when the list is empty', () => {
    stubLanguages([], 'zh-HK')
    expect(systemLanguageTags()).toEqual(['zh-HK'])
  })
})

describe('stored preference', () => {
  it('is undefined before the user picks one', () => {
    expect(getStoredPreference()).toBeUndefined()
    expect(resolvePreference()).toBe('fa-IR')
  })

  it('round-trips a persisted choice', () => {
    persistPreference('es')
    expect(getStoredPreference()).toBe('es')
    expect(resolvePreference()).toBe('es')
  })

  it('ignores a stored value that is not a known preference', () => {
    // A downgrade, a hand-edited value, or a locale we later dropped support for.
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'zh-CN')
    expect(getStoredPreference()).toBeUndefined()
    expect(resolvePreference()).toBe('fa-IR')
  })

  it('survives storage that throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })

    expect(getStoredPreference()).toBeUndefined()
    expect(() => persistPreference('zh-Hans')).not.toThrow()
  })
})

describe('resolveInitialLocale', () => {
  it('starts in Persian independently of the browser language', () => {
    stubLanguages(['ja', 'zh-TW', 'en'])
    expect(resolveInitialLocale()).toBe('fa-IR')
  })

  it('keeps explicit system-language detection available', () => {
    persistPreference('system')
    stubLanguages(['de-AT', 'en'])
    expect(resolveInitialLocale()).toBe('de')
    stubLanguages(['it-IT', 'vi-VN'])
    expect(resolveInitialLocale()).toBe('en')
  })

  it('restores a saved Persian preference', () => {
    persistPreference('fa-IR')
    stubLanguages(['en-US'])
    expect(resolveInitialLocale()).toBe('fa-IR')
  })

  it('honors an explicit stored choice over the device language', () => {
    stubLanguages(['zh-TW'])
    persistPreference('en')
    expect(resolveInitialLocale()).toBe('en')
  })

  it('re-detects when the stored choice is system', () => {
    stubLanguages(['zh-CN'])
    persistPreference('system')
    expect(resolveInitialLocale()).toBe('zh-Hans')
  })
})

describe('applyHtmlLang', () => {
  it('switches the language and keeps the left-to-right layout when Persian is selected or left', () => {
    applyHtmlLang('fa-IR')
    expect(document.documentElement.lang).toBe('fa-IR')
    expect(document.documentElement.dir).toBe('ltr')
    applyHtmlLang('en')
    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('writes a valid BCP-47 tag onto the document element', () => {
    applyHtmlLang('zh-Hant')
    expect(document.documentElement.lang).toBe('zh-Hant')
    applyHtmlLang('en')
    expect(document.documentElement.lang).toBe('en')
    applyHtmlLang('fr')
    expect(document.documentElement.lang).toBe('fr')
    applyHtmlLang('de')
    expect(document.documentElement.lang).toBe('de')
    applyHtmlLang('es')
    expect(document.documentElement.lang).toBe('es')
  })
})
