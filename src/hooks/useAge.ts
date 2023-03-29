import 'moment/locale/fr'

import { useMemo } from 'react'
import moment from 'moment'

import { useActiveLocale } from '@/hooks/useActiveLocale'

export default function useAge(date?: Date): string | undefined {
  const locale = useActiveLocale()

  return useMemo(() => {
    if (!date) return

    moment.locale('en', {
      relativeTime: {
        future: 'in %s',
        past: '%s',
        s: '1s',
        ss: '%ss',
        m: '1min',
        mm: '%dmin',
        h: '1h',
        hh: '%dh',
        d: '1d',
        dd: '%dd',
      },
    })

    moment.locale('fr', {
      relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s: '1s',
        ss: '%ss',
        m: '1min',
        mm: '%dmin',
        h: '1h',
        hh: '%dh',
        d: '1j',
        dd: '%dj',
      },
    })

    moment.relativeTimeThreshold('s', 60)
    moment.relativeTimeThreshold('m', 60)
    moment.relativeTimeThreshold('h', 24)
    moment.relativeTimeThreshold('d', 100_000_000) // any number big enough

    return moment(date).locale(locale).fromNow(true)
  }, [date, locale])
}
