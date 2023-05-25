import { useEffect, useMemo, useState } from 'react'

import { GenieStatus } from '@/types'

export default function useMergeGenieSatus(...status: GenieStatus[]) {
  const [error, setError] = useState<null | GenieStatus['error']>(null)
  const loading = useMemo(() => !!status.find(({ loading }) => loading), [status])

  useEffect(() => {
    if (loading) setError(null)
  }, [loading])

  return { loading, error }
}
