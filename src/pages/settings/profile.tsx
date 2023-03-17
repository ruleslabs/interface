import styled from 'styled-components'

import DefaultLayout from '@/components/Layout'
import SettingsLayout from '@/components/Layout/Settings'
import Column from '@/components/Column'
import DiscordSettings from '@/components/Settings/Discord'
import SocialAccountsSettings from '@/components/Settings/SocialAccounts'

const StyledProfileEditor = styled(Column)`
  width: 100%;
  gap: 24px;
`

function Profile() {
  return (
    <StyledProfileEditor>
      <DiscordSettings />
      <SocialAccountsSettings />
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
