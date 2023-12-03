import { useEffect, useState } from 'react'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, SupportedLocale } from 'src/constants/locales'
import store from 'src/state'
import { useUserLocale } from 'src/state/user/hooks'

import useLocationQuery from './useLocationQuery'

/**
 * Given a locale string (e.g. from user agent), return the best match for corresponding SupportedLocale
 * @param maybeSupportedLocale the fuzzy locale identifier
 */
function parseLocale(maybeSupportedLocale: unknown): SupportedLocale | undefined {
  if (typeof maybeSupportedLocale !== 'string') return undefined
  const lowerMaybeSupportedLocale = maybeSupportedLocale.toLowerCase()
  return SUPPORTED_LOCALES.find(
    (locale) => locale.toLowerCase() === lowerMaybeSupportedLocale || locale.split('-')[0] === lowerMaybeSupportedLocale
  )
}

/**
 * Returns the supported locale read from the user agent (navigator)
 */
function getNavigatorLocale(): SupportedLocale | undefined {
  if (!navigator.language) return undefined

  const [language, region] = navigator.language.split('-')

  if (region) {
    return parseLocale(`${language}-${region.toUpperCase()}`) ?? parseLocale(language)
  }

  return parseLocale(language)
}

function userLocale(): SupportedLocale | undefined {
  return store.getState().user.userLocale ?? undefined
}

export const initialLocale = userLocale() ?? DEFAULT_LOCALE

function useUrlLocale() {
  const query = useLocationQuery()
  return parseLocale(query.get('lng'))
}

/**
 * Returns the currently active locale, from a combination of user agent, query string, and user settings stored in redux
 * Stores the query string locale in redux (if set) to persist across sessions
 */
export function useActiveLocale(): SupportedLocale {
  const urlLocale = useUrlLocale()
  const userLocale = useUserLocale()
  const [locale, setLocale] = useState(urlLocale ?? userLocale ?? DEFAULT_LOCALE)

  useEffect(() => {
    const navigatorLocale = getNavigatorLocale()
    setLocale(urlLocale ?? userLocale ?? navigatorLocale ?? DEFAULT_LOCALE)
  }, [urlLocale, userLocale])

  return locale
}
