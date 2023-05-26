import styled from 'styled-components/macro'
import { t } from '@lingui/macro'

import DefaultLayout from 'src/components/Layout'
import SettingsLayout from 'src/components/Layout/Settings'
import Column from 'src/components/Column'
import Title from 'src/components/Text/Title'
import SessionsManager from 'src/components/Settings/SessionsManager'

const StyledSessionsSettings = styled(Column)`
  width: 100%;
  gap: 48px;
`

function SessionsSettings() {
  return (
    <StyledSessionsSettings>
      <Column gap={24}>
        <Title value={t`Active sessions`} />

        <SessionsManager />
      </Column>
    </StyledSessionsSettings>
  )
}

SessionsSettings.withLayout = () => (
  <DefaultLayout>
    <SettingsLayout>
      <SessionsSettings />
    </SettingsLayout>
  </DefaultLayout>
)

export default SessionsSettings
