import styled from 'styled-components'

import DefaultLayout from '@/components/Layout'
import SettingsLayout from '@/components/Layout/Settings'
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

function Security() {
  return (
    <StyledSection>
      <Column gap={32}>
        <TwoFactorAuthManager />
        <SessionsManager />
      </Column>
    </StyledSection>
  )
}

Security.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </DefaultLayout>
  )
}

export default Security
