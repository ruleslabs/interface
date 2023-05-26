import styled from 'styled-components/macro'

import Onboarding from 'src/components/Onboarding'
import Section from 'src/components/Section'
import EmptyLayout from 'src/components/Layout/Empty'

const StyledSection = styled(Section)`
  margin-top: 64px;

  ${({ theme }) => theme.media.small`
    margin-top: 40px;
  `}
`

function Onboard() {
  return (
    <StyledSection>
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
