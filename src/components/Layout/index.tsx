import React, { useEffect } from 'react'
import styled from 'styled-components'
import type { AppProps } from 'next/app'
import { shallow } from 'zustand/shallow'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import useWindowSize from '@/hooks/useWindowSize'
import Maintenance from '@/components/Maintenance'
import { useCurrentUser } from '@/graphql/data/CurrentUser'
import { useBoundStore } from '@/zustand'

const MainContent = styled.main<{ windowHeight?: number }>`
  min-height: ${({ theme, windowHeight = 0 }) => windowHeight - theme.size.footerHeight}px;
  position: relative;
`

interface DefaultLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  footerMargin?: number
  FooterChildrenComponent?: AppProps['Component']
}

export default function DefaultLayout({ children, FooterChildrenComponent }: DefaultLayoutProps) {
  const { data: currentUser, loading, refresh } = useCurrentUser()
  const { setCurrentUser, setCurrentUserRefresher } = useBoundStore(
    (state) => ({ setCurrentUser: state.setCurrentUser, setCurrentUserRefresher: state.setCurrentUserRefresher }),
    shallow
  )

  useEffect(() => {
    setCurrentUser(currentUser)
    setCurrentUserRefresher(refresh)
  }, [setCurrentUser, currentUser, refresh])

  // window size
  const windowSize = useWindowSize()

  if (loading) return null

  return (
    <>
      <MainContent windowHeight={windowSize.height}>
        <Header />

        {process.env.NEXT_PUBLIC_MAINTENANCE === 'true' ? <Maintenance /> : children}

        <Footer>{FooterChildrenComponent && <FooterChildrenComponent />}</Footer>
      </MainContent>
    </>
  )
}
