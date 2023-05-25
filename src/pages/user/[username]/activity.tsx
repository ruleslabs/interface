import DefaultLayout from 'src/components/Layout'
import ProfileLayout from 'src/components/Layout/Profile'
import { useStarknetTransactionsForAddress } from 'src/state/search/hooks'
import Section from 'src/components/Section'
import Column from 'src/components/Column'
import TransactionRow from 'src/components/TransactionRow'
import { PaginationSpinner } from 'src/components/Spinner'
import useInfiniteScroll from 'src/hooks/useInfiniteScroll'

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
  const isLoading = starknetTransactionQuery.loading

  // infinite scroll
  const lastTxRef = useInfiniteScroll({ nextPage: starknetTransactionQuery.nextPage, loading: isLoading })

  return (
    <Section marginTop="32px">
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

      <PaginationSpinner loading={isLoading} />
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
