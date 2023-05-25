import styled from 'styled-components/macro'

import Header from 'src/components/Header'
import Footer from 'src/components/Footer'
import useWindowSize from 'src/hooks/useWindowSize'
import Maintenance from 'src/components/Maintenance'

const MainContent = styled.main<{ windowHeight?: number }>`
  min-height: ${({ theme, windowHeight = 0 }) => windowHeight - theme.size.footerHeight}px;
  position: relative;
`

interface DefaultLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  footerMargin?: number
  FooterChildrenComponent?: () => JSX.Element
}

export default function DefaultLayout({ children, FooterChildrenComponent }: DefaultLayoutProps) {
  // window size
  const windowSize = useWindowSize()

  return (
    <MainContent windowHeight={windowSize.height}>
      <Header />

      {process.env.REACT_APP_MAINTENANCE === 'true' ? <Maintenance /> : children}

      <Footer>{FooterChildrenComponent?.()}</Footer>
    </MainContent>
  )
}
