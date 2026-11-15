// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { applyBidiRegions, regionDirection, textDirection } from './bidi-director'

const render = (html: string): HTMLElement => {
  document.body.innerHTML = `<div id="root"><div id="page">${html}</div></div>`
  return document.getElementById('page')!
}

beforeEach(() => {
  document.documentElement.lang = 'fa-IR'
})

afterEach(() => {
  document.documentElement.lang = 'en'
  document.body.innerHTML = ''
})

describe('textDirection', () => {
  it('follows the first strong character and ignores digits and punctuation', () => {
    expect(textDirection('۱۲ فایل')).toBe('rtl')
    expect(textDirection('12 files')).toBe('ltr')
    expect(textDirection('API کلید')).toBe('ltr')
    expect(textDirection(' 12 … ')).toBe('neutral')
  })
})

describe('regionDirection', () => {
  it('is right-to-left only when every text inside is Persian', () => {
    const page = render(
      '<div id="a"><span>پروژه‌ها</span><button><svg></svg>پروژهٔ جدید</button></div>' +
        '<div id="b"><span>محیط</span><span>Data location</span></div>'
    )
    expect(regionDirection(page.querySelector('#a')!)).toBe('rtl')
    expect(regionDirection(page.querySelector('#b')!)).toBe('ltr')
  })

  it('lets technical content and typed text stay out of the decision', () => {
    const page = render(
      '<form id="f"><label>مسیر</label><code>C:\\data</code><input placeholder="نام نمایشی" value="abc" /></form>'
    )
    expect(regionDirection(page.querySelector('#f')!)).toBe('rtl')
  })
})

describe('applyBidiRegions', () => {
  it('mirrors the outermost fully Persian region and leaves mixed regions in place', () => {
    const page = render(
      '<section id="persian"><h2>نشست‌های اخیر</h2><p>هنوز نشستی ندارید.</p></section>' +
        '<section id="mixed"><h2 id="heading">تنظیمات</h2><p>Model provider</p></section>'
    )
    applyBidiRegions()
    expect(page.querySelector('#persian')!.getAttribute('dir')).toBe('rtl')
    expect(page.querySelector('#persian h2')!.hasAttribute('dir')).toBe(false)
    expect(page.querySelector('#mixed')!.hasAttribute('dir')).toBe(false)
    expect(page.querySelector('#heading')!.getAttribute('dir')).toBe('rtl')
    expect(page.querySelector('#mixed p')!.hasAttribute('dir')).toBe(false)
  })

  it('never changes the page shell or a direction a component set itself', () => {
    render('<div id="menu" dir="ltr"><span id="item">ذخیره</span></div>')
    applyBidiRegions()
    expect(document.body.hasAttribute('dir')).toBe(false)
    expect(document.getElementById('root')!.hasAttribute('dir')).toBe(false)
    expect(document.getElementById('menu')!.getAttribute('dir')).toBe('ltr')
    expect(document.getElementById('item')!.getAttribute('dir')).toBe('rtl')
  })

  it('treats a box-less wrapper as page structure and directs its children instead', () => {
    const page = render(
      '<span>Persian Science</span>' +
        '<div id="wrapper" style="display: contents"><aside id="side">پروژه‌ها</aside><main id="body">نشست‌ها</main></div>'
    )
    applyBidiRegions()
    expect(page.querySelector('#wrapper')!.hasAttribute('dir')).toBe(false)
    expect(page.querySelector('#side')!.getAttribute('dir')).toBe('rtl')
    expect(page.querySelector('#body')!.getAttribute('dir')).toBe('rtl')
  })

  it('removes its marks when a region stops being Persian or the language changes', () => {
    const page = render('<div id="card"><span id="label">ذخیره</span></div>')
    applyBidiRegions()
    expect(page.getAttribute('dir')).toBe('rtl')

    page.querySelector('#label')!.textContent = 'Save'
    applyBidiRegions()
    expect(document.querySelector('[dir]')).toBeNull()

    page.querySelector('#label')!.textContent = 'ذخیره'
    applyBidiRegions()
    document.documentElement.lang = 'en'
    applyBidiRegions()
    expect(document.querySelector('[dir]')).toBeNull()
  })
})
