import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { useQueryCurrentUser } from '@/state/user/hooks'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import useWindowSize from '@/hooks/useWindowSize'

const MainContent = styled.main<{ windowHeight?: number }>`
  min-height: ${({ theme, windowHeight = 0 }) => windowHeight - theme.size.footerHeight}px;
  position: relative;
`

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const queryCurrentUser = useQueryCurrentUser()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    queryCurrentUser().then(() => setLoading(false))
  }, [queryCurrentUser, setLoading])

  // window size
  const windowSize = useWindowSize()

  if (loading) return null

  return (
    <>
      <MainContent windowHeight={windowSize.height}>
        <Header />
        {children}
        <Footer />
      </MainContent>
    </>
  )
}
