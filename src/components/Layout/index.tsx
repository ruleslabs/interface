import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { useQueryCurrentUser } from '@/state/user/hooks'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const MainContent = styled.main`
  min-height: calc(100vh - 128px);
  position: relative;
`

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const queryCurrentUser = useQueryCurrentUser()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    queryCurrentUser().then(() => setLoading(false))
  }, [queryCurrentUser, setLoading])

  if (loading) return null

  return (
    <>
      <MainContent>
        <Header />
        {children}
        <Footer />
      </MainContent>
    </>
  )
}
