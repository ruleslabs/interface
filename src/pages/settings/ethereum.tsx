import styled from 'styled-components'
import { t } from '@lingui/macro'

import DefaultLayout from '@/components/Layout'
import SettingsLayout from '@/components/Layout/Settings'
import Column from '@/components/Column'
import Title from '@/components/Settings/Title'

const StyledEthereumSettings = styled(Column)`
  width: 100%;
  gap: 48px;
`

function EthereumSettings() {
  return (
    <StyledEthereumSettings>
      <Column gap={24}>
        <Title value={t`Comming Soon`} />
      </Column>
    </StyledEthereumSettings>
  )
}

EthereumSettings.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </DefaultLayout>
  )
}

export default EthereumSettings
