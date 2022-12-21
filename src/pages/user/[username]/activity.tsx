import styled from 'styled-components'

import DefaultLayout from '@/components/Layout'
import ProfileLayout from '@/components/Layout/Profile'
import { useStarknetTransactionsForAddress } from '@/state/search/hooks'
import Section from '@/components/Section'
import Column from '@/components/Column'
import TransactionRow from '@/components/TransactionRow'
import Spinner from '@/components/Spinner'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'

// css

const StyledSpinner = styled(Spinner)`
  width: 32px;
  margin: 16px auto;
  display: block;
`

// Main Component

interface ExplorerProps {
  address: string
  publicKey: string
  userId: string
}

function Explorer({ address, publicKey, userId }: ExplorerProps) {
  const starknetTransactionQuery = useStarknetTransactionsForAddress(userId, address)
  const starknetTransactions = starknetTransactionQuery.data

  // loading / error
  const isValid = !starknetTransactionQuery.error
  const isLoading = starknetTransactionQuery.loading

  // infinite scroll
  const lastTxRef = useInfiniteScroll({ nextPage: starknetTransactionQuery.nextPage, loading: isLoading })

  return (
    <Section>
      <Column gap={16}>
        {starknetTransactions.map((starknetTransaction, index) => (
          <TransactionRow
            key={starknetTransaction.hash}
            innerRef={index + 1 === starknetTransactions.length ? lastTxRef : undefined}
            fromAddress={starknetTransaction.fromAddress}
            address={address}
            publicKey={publicKey}
            hash={starknetTransaction.hash}
            status={starknetTransaction.status}
            code={starknetTransaction.code}
            blockNumber={starknetTransaction.blockNumber}
            blockTimestamp={starknetTransaction.blockTimestamp}
            actualFee={starknetTransaction.actualFee}
            events={starknetTransaction.events}
            l2ToL1Messages={starknetTransaction.l2ToL1Messages}
            offchainData={starknetTransaction.offchainData}
          />
        ))}
      </Column>
      {isLoading && <StyledSpinner />}
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
