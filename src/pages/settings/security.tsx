import styled from 'styled-components'

import Section from '@/components/Section'
import Column from '@/components/Column'
import TwoFactorAuthManager from '@/components/TwoFactorAuthManager'
import SessionsManager from '@/components/SessionsManager'

const StyledSection = styled(Section)`
  margin-top: 64px;

  ${({ theme }) => theme.media.small`
    margin-top: 40px;
  `}
`

export default function Sessions() {
  return (
    <StyledSection>
      <Column gap={32}>
        <TwoFactorAuthManager />
        <SessionsManager />
      </Column>
    </StyledSection>
  )
}
