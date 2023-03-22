import styled from 'styled-components'
import { t } from '@lingui/macro'

import DefaultLayout from '@/components/Layout'
import SettingsLayout from '@/components/Layout/Settings'
import Column from '@/components/Column'
import SocialAccountsSettings from '@/components/Settings/SocialAccounts'
import Title from '@/components/Text/Title'
import DiscordStatus from '@/components/Settings/DiscordStatus'

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
