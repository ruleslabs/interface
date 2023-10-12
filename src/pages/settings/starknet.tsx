import styled from 'styled-components/macro'
import { t } from '@lingui/macro'

import DefaultLayout from 'src/components/Layout'
import SettingsLayout from 'src/components/Layout/Settings'
import Column from 'src/components/Column'
import Title from 'src/components/Text/Title'
import StarknetAccountStatus from 'src/components/Settings/StarknetAccountStatus'
import { ExternalStarknetAccountStatus } from 'src/components/Settings/ExternalWalletStatus'

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

      <Column gap={24}>
        <Title value={t`External wallet`} />

        <ExternalStarknetAccountStatus />
      </Column>
    </StyledStarknetSettings>
  )
}

StarknetSettings.withLayout = () => (
  <DefaultLayout>
    <SettingsLayout>
      <StarknetSettings />
    </SettingsLayout>
  </DefaultLayout>
)

export default StarknetSettings
