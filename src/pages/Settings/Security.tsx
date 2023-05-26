import styled from 'styled-components/macro'
import { t } from '@lingui/macro'

import DefaultLayout from 'src/components/Layout'
import SettingsLayout from 'src/components/Layout/Settings'
import Column from 'src/components/Column'
import Title from 'src/components/Text/Title'
import TwoFactorStatus from 'src/components/Settings/TwoFactorStatus'
import useCurrentUser from 'src/hooks/useCurrentUser'
import Label from 'src/components/Label'

const StyledSecuritySettings = styled(Column)`
  width: 100%;
  gap: 48px;
`

function SecuritySettings() {
  // current user
  const { currentUser } = useCurrentUser()

  return (
    <StyledSecuritySettings>
      <Column gap={24}>
        <Title value={t`Two-Factor Authentication (2FA)`}>
          {currentUser?.hasTwoFactorAuthActivated ? (
            <Label value={t`Enabled`} color="primary1" uppercased />
          ) : (
            <Label value={t`Disabled`} color="error" uppercased />
          )}
        </Title>
        <TwoFactorStatus />
      </Column>
    </StyledSecuritySettings>
  )
}

SecuritySettings.withLayout = () => (
  <DefaultLayout>
    <SettingsLayout>
      <SecuritySettings />
    </SettingsLayout>
  </DefaultLayout>
)

export default SecuritySettings
