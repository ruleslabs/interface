import styled from 'styled-components/macro'

import Onboarding from 'src/components/Onboarding'
import Section from 'src/components/Section'
import EmptyLayout from 'src/components/Layout/Empty'
import useWindowSize from 'src/hooks/useWindowSize'

const StyledSection = styled(Section)<{ $windowHeight: number }>`
  margin-top: 64px;
  position: relative;

  & > * {
    padding-left: inherit;
    padding-right: inherit;
  }

  ${({ theme, $windowHeight }) => theme.media.small`
      margin-top: 32px;
      height: ${`${$windowHeight - 32 * 2}px`};
  `}
`

function Onboard() {
  const { height: windowHeight } = useWindowSize()

  if (!windowHeight) return null

  return (
    <StyledSection $windowHeight={windowHeight}>
      <Onboarding />
    </StyledSection>
  )
}

Onboard.withLayout = () => (
  <EmptyLayout>
    <Onboard />
  </EmptyLayout>
)

export default Onboard
