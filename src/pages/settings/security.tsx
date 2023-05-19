import styled from 'styled-components'
import { t } from '@lingui/macro'

import DefaultLayout from '@/components/Layout'
import SettingsLayout from '@/components/Layout/Settings'
import Column from '@/components/Column'
import Title from '@/components/Text/Title'
import TwoFactorStatus from '@/components/Settings/TwoFactorStatus'
import useCurrentUser from '@/hooks/useCurrentUser'
import Label from '@/components/Label'

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

SecuritySettings.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </DefaultLayout>
  )
}

export default SecuritySettings
