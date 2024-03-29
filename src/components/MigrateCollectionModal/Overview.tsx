import { gql, useQuery } from '@apollo/client'
import { Plural, Trans } from '@lingui/macro'
import { useCallback, useMemo } from 'react'
import { PrimaryButton } from 'src/components/Button'
import { useCardsCount } from 'src/graphql/data/Cards'
import useCurrentUser from 'src/hooks/useCurrentUser'
import useRulesAccount from 'src/hooks/useRulesAccount'
import { TYPE } from 'src/styles/theme'
import { Column, Row } from 'src/theme/components/Flex'
import { ModalContentProps } from 'src/types'

import Link from '../Link'
import { ModalBody } from '../Modal/Classic'
import { PaginationSpinner } from '../Spinner'
import { StarknetStatus } from '../Web3Status'
import { MigrateCollectionModalMode } from '.'

const USER_PACKS_BALANCES_QUERY = gql`
  query ($slug: String!) {
    user(slug: $slug) {
      packsBalances {
        balance
        voucherBalance
      }
    }
  }
`

export default function MigrateCollectionModal({ setModalMode }: ModalContentProps<MigrateCollectionModalMode>) {
  // current user
  const { currentUser } = useCurrentUser()

  // starknet accounts
  const { address: rulesAddress } = useRulesAccount()

  // query packs
  const packsBalancesQuery = useQuery(USER_PACKS_BALANCES_QUERY, {
    variables: { slug: currentUser?.slug },
    skip: !currentUser?.slug,
  })

  // aggregate packs
  const packsBalances = packsBalancesQuery.data?.user?.packsBalances ?? []

  // packs count
  const packsCount = useMemo(
    () => (packsBalances as any[]).reduce<number>((acc, packBalance) => acc + packBalance.balance, 0),
    [packsBalances]
  )

  // cards count
  const cardsCountQuery = useCardsCount({
    filter: {
      ownerStarknetAddress: rulesAddress ?? '0x0',
      seasons: [],
      scarcityAbsoluteIds: [],
    },
  })
  const cardsCount = cardsCountQuery.data ?? 0

  // cards transfer
  const onCardsTransfer = useCallback(() => {
    if (!setModalMode) return

    setModalMode(MigrateCollectionModalMode.CARDS)
  }, [setModalMode])

  // packs transfer
  const onPacksTransfer = useCallback(() => {
    if (!setModalMode) return

    setModalMode(MigrateCollectionModalMode.PACKS)
  }, [setModalMode])

  // loading
  const loading = cardsCountQuery.loading || packsBalancesQuery.loading

  if (!currentUser) return null

  return (
    <ModalBody>
      {loading ? (
        <PaginationSpinner loading />
      ) : (
        <Column gap="32">
          <TYPE.large>
            <Trans>Dear Rulers</Trans>
          </TYPE.large>

          <TYPE.body textAlign="justify">
            <Trans>
              Thank you for your confidence in our platform. As previously announced,&nbsp;
              <Link href="#" target="_blank" underline>
                Rules is about to close.
              </Link>
              <br />
              <br />
              To ensure that you can continue to enjoy your collection, we have set up a simple transfer process to an
              external wallet (
              <Link href="https://www.argent.xyz/" target="_blank" underline>
                ArgentX
              </Link>
              <span> or </span>
              <Link href="https://braavos.app" target="_blank" underline>
                Braavos
              </Link>
              ).
            </Trans>
          </TYPE.body>

          <StarknetStatus>
            <Row gap="16">
              <PrimaryButton onClick={onCardsTransfer} width="full" disabled={!cardsCount} large>
                <Plural
                  value={cardsCount}
                  _0="No card to transfer"
                  _1="Transfer {cardsCount} card"
                  other="Transfer {cardsCount} cards"
                />
              </PrimaryButton>

              <PrimaryButton onClick={onPacksTransfer} width="full" disabled={!packsCount} large>
                <Plural
                  value={packsCount}
                  _0="No pack to transfer"
                  _1="Transfer {packsCount} pack"
                  other="Transfer {packsCount} packs"
                />
              </PrimaryButton>
            </Row>
          </StarknetStatus>
        </Column>
      )}
    </ModalBody>
  )
}
