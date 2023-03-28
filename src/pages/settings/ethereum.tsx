import styled from 'styled-components'
import { t } from '@lingui/macro'

import DefaultLayout from '@/components/Layout'
import SettingsLayout from '@/components/Layout/Settings'
import Column from '@/components/Column'
import Title from '@/components/Text/Title'
import EtherRetriever from '@/components/Settings/EtherRetriever'

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

EthereumSettings.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </DefaultLayout>
  )
}

export default EthereumSettings