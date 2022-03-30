import React, { useState, useEffect } from 'react'

import { useQueryCurrentUser } from '@/state/user/hooks'
import Header from '@/components/Header'

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const queryCurrentUser = useQueryCurrentUser()
  const [loading, setLoading] = useState(true)

  useEffect(async () => {
    await queryCurrentUser()
    setLoading(false)
  }, [queryCurrentUser, setLoading])

  if (loading) {
    return null
  }

  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}
