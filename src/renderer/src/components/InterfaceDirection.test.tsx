// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { Direction } from 'radix-ui'
import { afterEach, expect, it } from 'vitest'

import { useLocaleStore } from '@/stores/locale-store'
import { InterfaceDirection } from './InterfaceDirection'

const DirectionReader = (): React.JSX.Element => (
  <output data-testid="direction">{Direction.useDirection()}</output>
)

afterEach(() => {
  cleanup()
  useLocaleStore.setState({ preference: 'en', locale: 'en' })
})

it('updates Radix direction without remounting controls when the locale changes', () => {
  useLocaleStore.setState({ preference: 'fa-IR', locale: 'fa-IR' })
  render(
    <InterfaceDirection>
      <DirectionReader />
      <input aria-label="draft" defaultValue="retained" />
    </InterfaceDirection>
  )
  const input = screen.getByRole('textbox')
  expect(screen.getByTestId('direction').textContent).toBe('ltr')
  act(() => useLocaleStore.setState({ preference: 'en', locale: 'en' }))
  expect(screen.getByTestId('direction').textContent).toBe('ltr')
  expect(screen.getByRole('textbox')).toBe(input)
})
