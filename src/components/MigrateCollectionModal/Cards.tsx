import { useCallback, useEffect, useMemo } from 'react'
import { constants } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'
import { useAccount } from '@starknet-react/core'
import { gql, useQuery } from '@apollo/client'
import { Call, uint256 } from 'starknet'

import useCurrentUser from 'src/hooks/useCurrentUser'
import { PrimaryButton } from 'src/components/Button'
import { TYPE } from 'src/styles/theme'
import useRulesAccount from 'src/hooks/useRulesAccount'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { ModalBody } from '../Modal/Classic'
import { StarknetStatus } from '../Web3Status'
import { Column } from 'src/theme/components/Flex'
import StarknetSigner from '../StarknetSigner/Transaction'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { PaginationSpinner } from '../Spinner'
import { useModalOpened } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'

const CARDS_QUERY = gql`
  query ($address: String!) {
    cards(
      filter: { ownerStarknetAddress: $address, seasons: [], scarcityAbsoluteIds: [] }
      sort: { direction: DESC, type: AGE }
    ) {
      nodes {
        serialNumber
        tokenId
        cardModel {
          id
          pictureUrl(derivative: "width=256")
          season
          scarcity {
            name
          }
          artistName
        }
        voucherSigningData {
          signature {
            r
            s
          }
          salt
        }
      }
    }
  }
`

export default function CardsTransferModal() {
  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const isOpen = useModalOpened(ApplicationModal.MIGRATE_COLLECTION)

  // starknet accounts
  const { address: rulesAddress } = useRulesAccount()
  const { address: externalAddress } = useAccount()

  // starknet tx
  const { setCalls, resetStarknetTx, setSigning } = useStarknetTx()

  // cards query
  const cardsQuery = useQuery(CARDS_QUERY, { variables: { address: rulesAddress } })
  const cards: any[] = cardsQuery.data?.cards?.nodes ?? []

  // voucher signing data map
  const vouchersSigningDataMap = useMemo(
    () =>
      (cards as any[]).reduce<any>((acc, card) => {
        acc[card.tokenId] = card.voucherSigningData
        return acc
      }, {}),
    [cards.length]
  )

  // cards transfer call
  const handleMigration = useCallback(() => {
    if (!rulesAddress || !externalAddress) return

    const rulesTokensAddress = constants.RULES_TOKENS_ADDRESSES[rulesSdk.networkInfos.starknetChainId]

    const voucherRedeemCalls = cards
      .map((card) =>
        vouchersSigningDataMap[card.tokenId]
          ? rulesSdk.getVoucherRedeemToCall(
              rulesAddress,
              externalAddress,
              card.tokenId,
              1,
              vouchersSigningDataMap[card.tokenId].salt,
              vouchersSigningDataMap[card.tokenId].signature
            )
          : null
      )
      .filter((call): call is Call => !!call)

    const mintedCards = cards.filter((card) => !vouchersSigningDataMap[card.tokenId])

    // save calls
    setCalls([
      ...voucherRedeemCalls,
      {
        contractAddress: rulesTokensAddress,
        entrypoint: 'batch_transfer_from',
        calldata: [
          { from: rulesAddress },
          { to: externalAddress },

          { idsLen: mintedCards.length },
          ...mintedCards.flatMap((card) => {
            const u256TokenId = uint256.bnToUint256(card.tokenId)
            return [u256TokenId.low, u256TokenId.high]
          }), // ids

          { amountsLent: mintedCards.length },
          ...mintedCards.flatMap(() => [1, 0]), // amount.low, amount.high
        ],
      },
    ])

    setSigning(true)
  }, [rulesAddress, externalAddress, setCalls, setSigning, cards.length])

  // on modal update
  useEffect(() => {
    resetStarknetTx()
  }, [isOpen])

  // loading
  const loading = cardsQuery.loading

  if (!currentUser) return null

  return (
    <ModalBody>
      <StarknetSigner action={'transfer'}>
        {loading ? (
          <PaginationSpinner loading />
        ) : (
          <Column gap={'24'}>
            <TYPE.body textAlign="justify">
              <Trans>
                Due to Starknet limitations, you cannot transfer more than 50 cards per transaction. If necessary you
                will have to repeat this operation to transfer all your cards.
              </Trans>
            </TYPE.body>

            <StarknetStatus>
              <PrimaryButton onClick={handleMigration} large>
                <Trans>Confirm</Trans>
              </PrimaryButton>
            </StarknetStatus>
          </Column>
        )}
      </StarknetSigner>
    </ModalBody>
  )
}
