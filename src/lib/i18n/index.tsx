import React, { useCallback } from 'react'

import { SupportedLocale } from '@/constants/locales'
import { initialLocale, useActiveLocale } from '@/hooks/useActiveLocale'
import { dynamicActivate, Provider } from './provider'
import { useUserLocaleManager } from '@/state/user/hooks'
import { DEFAULT_LOCALE } from '@/constants/locales'

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
    <Provider locale={locale} forceRenderAfterLocaleChange={false} onActivate={onActivate}>
      {children}
    </Provider>
  )
}
