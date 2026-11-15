import { useEffect, useRef } from 'react'

import logoUrl from '@/assets/logo.png'

import { resolveLogoFrame, type LogoCanvasMetrics } from './persian-science-logo-motion'

const LOOP_DURATION_MS = 4800
const MAX_ANIMATION_FPS = 30
const MIN_FRAME_INTERVAL_MS = 1000 / MAX_ANIMATION_FPS
// The startup surface is short-lived; 2x keeps the logo crisp without allocating a 3x/4x canvas.
const MAX_DEVICE_PIXEL_RATIO = 2
const FALLBACK_CANVAS_SIZE = 448
let animationStartedAt: number | undefined

const resolveAnimationTime = (now: number): number => {
  animationStartedAt ??= now
  return now - animationStartedAt
}

const PersianScienceLogoLoader = (): React.JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) return

    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    let dprMediaQuery: MediaQueryList | undefined
    let prefersReducedMotion = mediaQuery?.matches ?? false
    let animationFrame: number | undefined
    let metrics: LogoCanvasMetrics = { width: 1, height: 1, dpr: 1 }
    const logo = new Image()
    logo.src = logoUrl
    let color = getComputedStyle(canvas).color
    let lastDrawnAt: number | undefined

    const draw = (time: number): void => {
      context.clearRect(0, 0, metrics.width, metrics.height)
      if (!logo.complete || !logo.naturalWidth) return
      const frame = resolveLogoFrame(time, LOOP_DURATION_MS, prefersReducedMotion)
      const strength =
        frame.mode === 'hold'
          ? 1
          : frame.mode === 'gather'
            ? 0.4 + frame.progress * 0.6
            : frame.mode === 'release'
              ? 1 - frame.progress * 0.6
              : 0.4
      const breath = prefersReducedMotion ? 1 : 1 + Math.sin(time * 0.0026) * 0.018
      const size = Math.min(metrics.width, metrics.height) * 0.42 * breath
      context.save()
      context.fillStyle = color
      context.globalAlpha = strength
      context.drawImage(logo, (metrics.width - size) / 2, (metrics.height - size) / 2, size, size)
      context.restore()
    }

    const animate = (now: number): void => {
      if (lastDrawnAt === undefined || now - lastDrawnAt >= MIN_FRAME_INTERVAL_MS) {
        draw(resolveAnimationTime(now))
        lastDrawnAt = now
      }
      animationFrame = requestAnimationFrame(animate)
    }

    const restartLoop = (): void => {
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame)

      animationFrame = undefined
      const now = performance.now()
      lastDrawnAt = now

      if (prefersReducedMotion) draw(0)
      else {
        draw(resolveAnimationTime(now))
        animationFrame = requestAnimationFrame(animate)
      }
    }

    const resize = (): void => {
      const bounds = canvas.getBoundingClientRect()
      const cssWidth = bounds.width || FALLBACK_CANVAS_SIZE
      const cssHeight = bounds.height || FALLBACK_CANVAS_SIZE
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO)
      const width = Math.max(1, Math.round(cssWidth * dpr))
      const height = Math.max(1, Math.round(cssHeight * dpr))

      if (canvas.width === width && canvas.height === height && metrics.width > 1) return

      canvas.width = width
      canvas.height = height
      metrics = { width, height, dpr }
      color = getComputedStyle(canvas).color
      restartLoop()
    }

    const handleMotionPreferenceChange = (event: MediaQueryListEvent): void => {
      prefersReducedMotion = event.matches
      restartLoop()
    }

    const handleDevicePixelRatioChange = (): void => {
      dprMediaQuery?.removeEventListener('change', handleDevicePixelRatioChange)
      resize()
      observeDevicePixelRatio()
    }

    // Resolution media queries fire when an Electron window crosses displays without changing CSS size.
    const observeDevicePixelRatio = (): void => {
      dprMediaQuery = window.matchMedia?.(`(resolution: ${window.devicePixelRatio || 1}dppx)`)
      dprMediaQuery?.addEventListener('change', handleDevicePixelRatioChange)
    }

    const handleThemeChange = (): void => {
      color = getComputedStyle(canvas).color
      if (prefersReducedMotion) draw(0)
    }

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(resize)
    const themeObserver = new MutationObserver(handleThemeChange)

    resizeObserver?.observe(canvas)
    if (!resizeObserver) window.addEventListener('resize', resize, { passive: true })
    mediaQuery?.addEventListener('change', handleMotionPreferenceChange)
    observeDevicePixelRatio()
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    logo.onload = restartLoop
    resize()

    return () => {
      logo.onload = null
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame)
      resizeObserver?.disconnect()
      if (!resizeObserver) window.removeEventListener('resize', resize)
      mediaQuery?.removeEventListener('change', handleMotionPreferenceChange)
      dprMediaQuery?.removeEventListener('change', handleDevicePixelRatioChange)
      themeObserver.disconnect()
    }
  }, [])

  return (
    <div className="relative size-56 shrink-0" aria-hidden="true">
      <canvas
        ref={canvasRef}
        data-testid="open-science-logo-loader"
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[min(200%,100vw)] -translate-x-1/2 -translate-y-1/2 text-foreground"
      />
    </div>
  )
}

export { PersianScienceLogoLoader }
