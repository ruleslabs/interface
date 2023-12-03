import { t } from '@lingui/macro'
import Column from 'src/components/Column'
import DefaultLayout from 'src/components/Layout'
import SettingsLayout from 'src/components/Layout/Settings'
import EtherRetriever from 'src/components/Settings/EtherRetriever'
import { ExternalEthereumWalletStatus } from 'src/components/Settings/ExternalWalletStatus'
import Title from 'src/components/Text/Title'
import styled from 'styled-components/macro'

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

      <Column gap={24}>
        <Title value={t`External wallet`} />

        <ExternalEthereumWalletStatus />
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
