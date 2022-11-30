import DefaultLayout from '@/components/Layout'
import ProfileLayout from '@/components/Layout/Profile'
import { TYPE } from '@/styles/theme'
import { useStarknetTransactionsForAddress } from '@/state/search/hooks'
import Section from '@/components/Section'
import Column from '@/components/Column'
import TransactionRow from '@/components/TransactionRow'

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
      <Column gap={16}>
        {starknetTransactions.map((starknetTransaction) => (
          <TransactionRow
            key={starknetTransaction.hash}
            fromAddress={starknetTransaction.fromAddress}
            address={address}
            hash={starknetTransaction.hash}
            status={starknetTransaction.status}
            code={starknetTransaction.code}
            blockNumber={starknetTransaction.blockNumber}
            blockTimestamp={starknetTransaction.blockTimestamp}
            actualFee={starknetTransaction.actualFee}
          />
        ))}
      </Column>
      {isLoading ? <TYPE.body>loading</TYPE.body> : nextPage && <button onClick={nextPage}>load more</button>}
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
