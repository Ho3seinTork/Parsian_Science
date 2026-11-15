import { Direction } from 'radix-ui'
import type { PropsWithChildren } from 'react'

import { localeDirection } from '../../../shared/locale'
import { useLocaleStore } from '@/stores/locale-store'

// Radix keyboard navigation needs direction context as well as <html dir>.
// Keep the provider above portals and the desktop title bar, with no extra layout element.
export const InterfaceDirection = ({ children }: PropsWithChildren): React.JSX.Element => {
  const locale = useLocaleStore((state) => state.locale)
  return <Direction.Provider dir={localeDirection(locale)}>{children}</Direction.Provider>
}
