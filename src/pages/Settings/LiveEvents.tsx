import styled from 'styled-components/macro'
import { t } from '@lingui/macro'

import DefaultLayout from 'src/components/Layout'
import SettingsLayout from 'src/components/Layout/Settings'
import Column from 'src/components/Column'
import Title from 'src/components/Text/Title'
import LiveRewards from 'src/components/Settings/LiveRewards'

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

LiveEventsSettings.withLayout = () => (
  <DefaultLayout>
    <SettingsLayout>
      <LiveEventsSettings />
    </SettingsLayout>
  </DefaultLayout>
)

export default LiveEventsSettings
