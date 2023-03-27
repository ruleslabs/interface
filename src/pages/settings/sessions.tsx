import styled from 'styled-components'
import { t } from '@lingui/macro'

import DefaultLayout from '@/components/Layout'
import SettingsLayout from '@/components/Layout/Settings'
import Column from '@/components/Column'
import Title from '@/components/Text/Title'
import SessionsManager from '@/components/Settings/SessionsManager'

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

SessionsSettings.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </DefaultLayout>
  )
}

export default SessionsSettings
