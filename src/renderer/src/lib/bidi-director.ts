// Bilingual layout for the partially translated Persian interface.
//
// The page skeleton stays left-to-right. Inside it, every region whose text is entirely Persian is
// laid out right-to-left as a unit (text on the right, icon after it, actions mirrored), while a
// region that still contains English keeps the left-to-right layout and only its Persian parts are
// mirrored. A fully translated dialog therefore reads as a native right-to-left dialog, and an
// untranslated one is unchanged.

type Direction = 'rtl' | 'ltr' | 'neutral'

// Code point ranges with a strong direction: Hebrew through Thaana and the Arabic presentation
// forms read right-to-left; Latin, Greek, Cyrillic, kana, CJK and Hangul read left-to-right.
const RTL_RANGES: readonly (readonly [number, number])[] = [
  [0x0591, 0x07ff],
  [0xfb1d, 0xfdfd],
  [0xfe70, 0xfefc]
]
const LTR_RANGES: readonly (readonly [number, number])[] = [
  [0x41, 0x5a],
  [0x61, 0x7a],
  [0xc0, 0x24f],
  [0x370, 0x3ff],
  [0x400, 0x4ff],
  [0x3040, 0x30ff],
  [0x4e00, 0x9fff],
  [0xac00, 0xd7af]
]
const within = (ranges: readonly (readonly [number, number])[], code: number): boolean =>
  ranges.some(([from, to]) => code >= from && code <= to)

// Content with its own reading order: it never decides the direction of the region around it.
const TECHNICAL =
  'pre, code, kbd, samp, svg, math, script, style, canvas, iframe, .font-mono, .cm-editor, .monaco-editor, .xterm, .katex, [data-direction], [contenteditable="true"]'
// Prose rendered from the agent: one unit whose direction follows how it starts.
const PROSE = '.agent-markdown'
const MARK = 'data-bidi-region'

export const textDirection = (text: string): Direction => {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index)
    if (within(RTL_RANGES, code)) return 'rtl'
    if (within(LTR_RANGES, code)) return 'ltr'
  }
  return 'neutral'
}

const combine = (current: Direction, next: Direction): Direction =>
  current === 'ltr' || next === 'ltr'
    ? 'ltr'
    : current === 'rtl' || next === 'rtl'
      ? 'rtl'
      : 'neutral'

// 'rtl' only when every piece of text inside the element is Persian.
export const regionDirection = (element: Element): Direction => {
  if (element.matches(TECHNICAL)) return 'neutral'
  if (element.matches(PROSE)) return textDirection((element.textContent ?? '').slice(0, 400))
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return textDirection(element.placeholder)
  }
  let direction: Direction = 'neutral'
  for (const node of element.childNodes) {
    if (node instanceof Text) direction = combine(direction, textDirection(node.data))
    else if (node instanceof Element) {
      // A child with its own explicit direction cannot be mirrored as part of this region.
      const fixed = node.hasAttribute('dir') && !node.hasAttribute(MARK)
      direction = combine(direction, fixed ? 'ltr' : regionDirection(node))
    }
    if (direction === 'ltr') return 'ltr'
  }
  return direction
}

// Mirroring a page-sized container would move whole panes; those keep the page direction.
const isPageShell = (element: Element, viewport: { width: number; height: number }): boolean => {
  if (element === document.body || element.id === 'root') return true
  // A box-less wrapper (display: contents) passes its children straight to the page layout.
  if (getComputedStyle(element).display === 'contents') return true
  const bounds = element.getBoundingClientRect()
  return bounds.width >= viewport.width * 0.9 && bounds.height >= viewport.height * 0.6
}

const clearMarks = (element: Element): void => {
  for (const marked of element.querySelectorAll(`[${MARK}]`)) {
    marked.removeAttribute(MARK)
    marked.removeAttribute('dir')
  }
}

const direct = (element: Element, viewport: { width: number; height: number }): void => {
  if (element.matches(TECHNICAL)) return
  // An explicit direction set by a component is its own decision.
  const explicit = element.hasAttribute('dir') && !element.hasAttribute(MARK)
  if (!explicit && regionDirection(element) === 'rtl' && !isPageShell(element, viewport)) {
    clearMarks(element)
    if (element.getAttribute('dir') !== 'rtl') element.setAttribute('dir', 'rtl')
    element.setAttribute(MARK, '')
    return
  }
  if (element.hasAttribute(MARK)) {
    element.removeAttribute(MARK)
    element.removeAttribute('dir')
  }
  if (element.matches(PROSE)) return
  for (const child of element.children) direct(child, viewport)
}

export const applyBidiRegions = (root: Element = document.body): void => {
  const viewport = { width: window.innerWidth, height: window.innerHeight }
  if (document.documentElement.lang !== 'fa-IR') {
    clearMarks(root)
    return
  }
  for (const child of root.children) direct(child, viewport)
}

// Keeps the regions current as the interface renders. Returns a function that stops observing.
export const installBidiDirector = (): (() => void) => {
  let scheduled: ReturnType<typeof setTimeout> | undefined
  const schedule = (): void => {
    if (scheduled !== undefined) return
    scheduled = setTimeout(() => {
      scheduled = undefined
      applyBidiRegions()
    }, 60)
  }
  const content = new MutationObserver(schedule)
  content.observe(document.body, { childList: true, characterData: true, subtree: true })
  const language = new MutationObserver(schedule)
  language.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
  window.addEventListener('resize', schedule)
  schedule()
  return () => {
    content.disconnect()
    language.disconnect()
    window.removeEventListener('resize', schedule)
    if (scheduled !== undefined) clearTimeout(scheduled)
  }
}
