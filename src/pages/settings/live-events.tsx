import styled from 'styled-components'
import { t } from '@lingui/macro'

import DefaultLayout from '@/components/Layout'
import SettingsLayout from '@/components/Layout/Settings'
import Column from '@/components/Column'
import Title from '@/components/Text/Title'
import LiveRewards from '@/components/Settings/LiveReward'

const StyledSecuritySettings = styled(Column)`
  width: 100%;
  gap: 48px;
`

function LiveEventsSettings() {
  return (
    <StyledSecuritySettings>
      <Column gap={24}>
        <Title value={t`Live rewards`} />
        <LiveRewards />
      </Column>
    </StyledSecuritySettings>
  )
}

LiveEventsSettings.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </DefaultLayout>
  )
}

export default LiveEventsSettings
