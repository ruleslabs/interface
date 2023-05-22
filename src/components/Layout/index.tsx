import styled from 'styled-components'
import type { AppProps } from 'next/app'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import useWindowSize from '@/hooks/useWindowSize'
import Maintenance from '@/components/Maintenance'

const MainContent = styled.main<{ windowHeight?: number }>`
  min-height: ${({ theme, windowHeight = 0 }) => windowHeight - theme.size.footerHeight}px;
  position: relative;
`

interface DefaultLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  footerMargin?: number
  FooterChildrenComponent?: AppProps['Component']
}

export default function DefaultLayout({ children, FooterChildrenComponent }: DefaultLayoutProps) {
  // window size
  const windowSize = useWindowSize()

  return (
    <MainContent windowHeight={windowSize.height}>
      <Header />

      {process.env.NEXT_PUBLIC_MAINTENANCE === 'true' ? <Maintenance /> : children}

      <Footer>{FooterChildrenComponent && <FooterChildrenComponent />}</Footer>
    </MainContent>
  )
}
