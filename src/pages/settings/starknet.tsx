import styled from 'styled-components/macro'
import { t } from '@lingui/macro'

import DefaultLayout from 'src/components/Layout'
import SettingsLayout from 'src/components/Layout/Settings'
import Column from 'src/components/Column'
import Title from 'src/components/Text/Title'
import StarknetAccountStatus from 'src/components/Settings/StarknetAccountStatus'

const StyledStarknetSettings = styled(Column)`
  width: 100%;
  gap: 48px;
`

function StarknetSettings() {
  return (
    <StyledStarknetSettings>
      <Column gap={24}>
        <Title value={t`My account`} />

        <StarknetAccountStatus />
      </Column>
    </StyledStarknetSettings>
  )
}

StarknetSettings.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </DefaultLayout>
  )
}

export default StarknetSettings
