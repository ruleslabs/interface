import { useMemo } from 'react'
import moment from 'moment'

import { useActiveLocale } from './useActiveLocale'

export default function useFormatedDate(date?: Date) {
  const locale = useActiveLocale()

  return useMemo(() => {
    if (!date) return

    const releaseMoment = moment(date)
    releaseMoment.locale(locale)

    return releaseMoment.format('dddd D MMMM LT')
  }, [date, locale])
}
