import { afterEach, describe, expect, it } from 'vitest'

import fa from '../../../shared/i18n/locales/fa-IR.json'
import de from '../../../shared/i18n/locales/de.json'
import { hasValidTagStructure } from '../../../shared/i18n/core'
import { createNativeI18n } from '../../../main/locale/main-process-messages'
import { initI18n, prepareI18nLocale } from './index'

const markers = (text: string): string[] =>
  [...text.matchAll(/\{\{(\w+)\}\}|<(\/?\w+)>/g)].map((match) => match[0]).sort()

afterEach(() => {
  initI18n('en')
})

// Persian is an explicitly partial catalog. Validate every delivered translation and actual
// fallback behavior; do not manufacture English-valued entries to imply full coverage.
describe('Persian catalog integrity and runtime', () => {
  it('keeps the three process namespaces and only keys from the existing source catalogs', () => {
    expect(Object.keys(fa)).toEqual(['common', 'native', 'renderer'])
    for (const namespace of ['common', 'native', 'renderer'] as const) {
      const sourceKeys = new Set(Object.keys(de[namespace]).map((key) => key.split('_')[0]))
      for (const [key, value] of Object.entries(fa[namespace])) {
        expect(sourceKeys.has(key.split('_')[0]), key).toBe(true)
        expect(value.trim().length, key).toBeGreaterThan(0)
        expect(markers(value), key).toEqual(markers(key.split('_')[0]))
        expect(hasValidTagStructure(value), key).toBe(true)
      }
    }
  })

  it('provides both Persian plural forms for every translated counted key', () => {
    for (const namespace of ['common', 'native', 'renderer'] as const) {
      const catalog: Record<string, string> = fa[namespace]
      for (const key of Object.keys(catalog)) {
        if (!/_(one|other)$/.test(key)) continue
        const base = key.replace(/_(one|other)$/, '')
        expect(catalog[`${base}_one`], key).toBeTruthy()
        expect(catalog[`${base}_other`], key).toBeTruthy()
      }
    }
  })

  it('loads Persian for the renderer and native surfaces and keeps English source fallback', async () => {
    await prepareI18nLocale('fa-IR')
    const renderer = initI18n('fa-IR')
    expect(renderer.t('Settings')).toBe('تنظیمات')
    expect(renderer.t('Cancel')).toBe(fa.common.Cancel)
    expect(createNativeI18n('fa-IR').t('Cancel')).toBe(fa.common.Cancel)
    expect(renderer.t('Untranslated sample {{name}}', { name: 'model-42' })).toBe(
      'Untranslated sample model-42'
    )
    // Persian treats zero as 'one'; an untranslated English message must retain English plurals.
    expect(
      renderer.t('{{count}} untranslated files', {
        count: 0,
        defaultValue_one: '{{count}} untranslated file'
      })
    ).toBe('0 untranslated files')
    expect(initI18n('en').t('Settings')).toBe('Settings')
  })
})
