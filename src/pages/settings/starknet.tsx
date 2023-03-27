import styled from 'styled-components'
import { t } from '@lingui/macro'

import DefaultLayout from '@/components/Layout'
import SettingsLayout from '@/components/Layout/Settings'
import Column from '@/components/Column'
import Title from '@/components/Text/Title'
import StarknetAccountStatus from '@/components/Settings/StarknetAccountStatus'

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
