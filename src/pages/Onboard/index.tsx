import styled from 'styled-components/macro'

import Onboarding from 'src/components/Onboarding'
import Section from 'src/components/Section'

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

export default Onboard
