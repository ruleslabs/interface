import styled from 'styled-components'

import Onboarding from '@/components/Onboarding'
import Section from '@/components/Section'

const StyledSection = styled(Section)`
  margin-top: 64px;

  ${({ theme }) => theme.media.small`
    margin-top: 40px;
  `}
`

export default function Onboard() {
  return (
    <StyledSection>
      <Onboarding />
    </StyledSection>
  )
}
