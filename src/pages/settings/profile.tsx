import styled from 'styled-components/macro'
import { t } from '@lingui/macro'

import DefaultLayout from 'src/components/Layout'
import SettingsLayout from 'src/components/Layout/Settings'
import Column from 'src/components/Column'
import SocialAccountsSettings from 'src/components/Settings/SocialAccounts'
import Title from 'src/components/Text/Title'
import DiscordStatus from 'src/components/Settings/DiscordStatus'

const StyledProfileSettings = styled(Column)`
  width: 100%;
  gap: 48px;
`

function ProfileSettings() {
  return (
    <StyledProfileSettings>
      <Column gap={24}>
        <Title value={t`Discord`} />
        <DiscordStatus redirectPath="/settings/profile" />
      </Column>

      <Column gap={24}>
        <Title value={t`Public profile`} />
        <SocialAccountsSettings />
      </Column>
    </StyledProfileSettings>
  )
}

ProfileSettings.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </DefaultLayout>
  )
}

export default ProfileSettings
