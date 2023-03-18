import styled from 'styled-components'
import { t } from '@lingui/macro'

import DefaultLayout from '@/components/Layout'
import SettingsLayout from '@/components/Layout/Settings'
import Column from '@/components/Column'
import SocialAccountsSettings from '@/components/Settings/SocialAccounts'
import Title from '@/components/Settings/Title'
import DiscordStatus from '@/components/Settings/DiscordStatus'

const StyledProfileEditor = styled(Column)`
  width: 100%;
  gap: 48px;
`

function Profile() {
  return (
    <StyledProfileEditor>
      <Column gap={24}>
        <Title value={t`Discord`} />
        <DiscordStatus redirectPath="/settings/profile" />
      </Column>

      <Column gap={24}>
        <Title value={t`Public profile`} />
        <SocialAccountsSettings />
      </Column>
    </StyledProfileEditor>
  )
}

Profile.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </DefaultLayout>
  )
}

export default Profile
