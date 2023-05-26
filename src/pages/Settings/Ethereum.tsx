import styled from 'styled-components/macro'
import { t } from '@lingui/macro'

import DefaultLayout from 'src/components/Layout'
import SettingsLayout from 'src/components/Layout/Settings'
import Column from 'src/components/Column'
import Title from 'src/components/Text/Title'
import EtherRetriever from 'src/components/Settings/EtherRetriever'

const StyledEthereumSettings = styled(Column)`
  width: 100%;
  gap: 48px;
`

function EthereumSettings() {
  return (
    <StyledEthereumSettings>
      <Column gap={24}>
        <Title value={t`ETH retrieve`} />

        <EtherRetriever />
      </Column>
    </StyledEthereumSettings>
  )
}

EthereumSettings.withLayout = () => (
  <DefaultLayout>
    <SettingsLayout>
      <EthereumSettings />
    </SettingsLayout>
  </DefaultLayout>
)

export default EthereumSettings
