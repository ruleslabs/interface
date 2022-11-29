import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import DefaultLayout from '@/components/Layout'
import ProfileLayout from '@/components/Layout/Profile'
import { TYPE } from '@/styles/theme'
import { useStarknetTransactionsForAddress } from '@/state/search/hooks'
import Section from '@/components/Section'
import Table from '@/components/Table'
import Card from '@/components/Card'
import TransactionRow from '@/components/TransactionRow'

const StyledTable = styled(Table)`
  tbody tr {
    border-style: solid;
    border-color: ${({ theme }) => theme.text1};
    border-width: 0 0 1px 0;
  }
`

// Main Component

interface ExplorerProps {
  address: string
}

function Explorer({ address }: ExplorerProps) {
  const [nextPage, starknetTransactionQuery] = useStarknetTransactionsForAddress(address)
  const starknetTransactions = starknetTransactionQuery.data

  // loading / error
  const isValid = !starknetTransactionQuery.error
  const isLoading = starknetTransactionQuery.loading

  return (
    <Section>
      <Card>
        <StyledTable>
          <thead>
            <tr>
              <td>
                <TYPE.body>
                  <Trans>Transaction hash</Trans>
                </TYPE.body>
              </td>
              <td>
                <TYPE.body>
                  <Trans>Block number</Trans>
                </TYPE.body>
              </td>
              <td>
                <TYPE.body>
                  <Trans>Status</Trans>
                </TYPE.body>
              </td>
              <td>
                <TYPE.body>
                  <Trans>Fee</Trans>
                </TYPE.body>
              </td>
              <td>
                <TYPE.body>
                  <Trans>Age</Trans>
                </TYPE.body>
              </td>
            </tr>
          </thead>

          <tbody>
            {starknetTransactions.map((starknetTransaction) => (
              <TransactionRow
                key={starknetTransaction.hash}
                hash={starknetTransaction.hash}
                status={starknetTransaction.status}
                blockNumber={starknetTransaction.blockNumber}
                blockTimestamp={starknetTransaction.blockTimestamp}
                actualFee={starknetTransaction.actualFee}
              />
            ))}
          </tbody>
        </StyledTable>
        {isLoading ? <TYPE.body>loading</TYPE.body> : nextPage && <button onClick={nextPage}>load more</button>}
      </Card>
    </Section>
  )
}

Explorer.getLayout = (page: JSX.Element) => {
  return (
    <DefaultLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </DefaultLayout>
  )
}

export default Explorer
