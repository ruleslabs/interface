import { useCallback } from 'react'
import { SupportedLocale } from 'src/constants/locales'
import { initialLocale, useActiveLocale } from 'src/hooks/useActiveLocale'
import { useUserLocaleManager } from 'src/state/user/hooks'

import { dynamicActivate, Provider } from './provider'

dynamicActivate(initialLocale)

interface LanguageProviderProps {
  children: React.ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const locale = useActiveLocale()
  const [, setUserLocale] = useUserLocaleManager()

  const onActivate = useCallback(
    (locale: SupportedLocale) => {
      document.documentElement.setAttribute('lang', locale)
      setUserLocale(locale) // stores the selected locale to persist across sessions
    },
    [setUserLocale]
  )

  return (
    <Provider locale={locale} onActivate={onActivate}>
      {children}
    </Provider>
  )
}
