import DefaultLayout from 'src/components/Layout'
import ProfileLayout from 'src/components/Layout/Profile'
import { useStarknetTransactionsForAddress } from 'src/state/search/hooks'
import Section from 'src/components/Section'
import Column from 'src/components/Column'
import TransactionRow from 'src/components/TransactionRow'
import { PaginationSpinner } from 'src/components/Spinner'
import useInfiniteScroll from 'src/hooks/useInfiniteScroll'
import useSearchedUser from 'src/hooks/useSearchedUser'

// Main Component

function UserActivity() {
  // searched user
  const [user] = useSearchedUser()

  const starknetTransactionQuery = useStarknetTransactionsForAddress(user?.id, user?.address)
  const starknetTransactions = starknetTransactionQuery.data

  // loading / error
  const isLoading = starknetTransactionQuery.loading

  // infinite scroll
  const lastTxRef = useInfiniteScroll({ nextPage: starknetTransactionQuery.nextPage, loading: isLoading })

  if (!user) return null

  return (
    <Section marginTop="32px">
      <Column gap={16}>
        {starknetTransactions.map((starknetTransaction, index) => (
          <TransactionRow
            key={starknetTransaction.hash}
            innerRef={index + 1 === starknetTransactions.length ? lastTxRef : undefined}
            fromAddress={starknetTransaction.fromAddress}
            address={user.address}
            publicKey={user.publicKey}
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

UserActivity.withLayout = () => (
  <DefaultLayout>
    <ProfileLayout>
      <UserActivity />
    </ProfileLayout>
  </DefaultLayout>
)

export default UserActivity
