import { useCallback, useEffect, useMemo } from 'react'
import { constants } from '@rulesorg/sdk-core'
import { Trans, t } from '@lingui/macro'
import { useAccount } from '@starknet-react/core'
import { gql, useQuery } from '@apollo/client'
import { Call, uint256 } from 'starknet'

import { useModalOpened, useMigrateCollectionModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { PrimaryButton } from 'src/components/Button'
import { TYPE } from 'src/styles/theme'
import useRulesAccount from 'src/hooks/useRulesAccount'
import useStarknetTx from 'src/hooks/useStarknetTx'
import ClassicModal, { ModalBody, ModalContent } from '../Modal/Classic'
import { ModalHeader } from '../Modal'
import { StarknetStatus } from '../Web3Status'
import { Column } from 'src/theme/components/Flex'
import StarknetSigner from '../StarknetSigner/Transaction'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { PaginationSpinner } from '../Spinner'

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

export default function MigrateCollectionModal() {
  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const isOpen = useModalOpened(ApplicationModal.MIGRATE_COLLECTION)
  const toggleMigrateCollectionModal = useMigrateCollectionModalToggle()

  // starknet accounts
  const { address: rulesAddress } = useRulesAccount()
  const { address: externalAddress } = useAccount()

  // starknet tx
  const { setCalls, resetStarknetTx, setSigning, signing } = useStarknetTx()

  // cards query
  const cardsQuery = useQuery(CARDS_QUERY, { variables: { address: rulesAddress }, skip: !isOpen })
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

  // call
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

  // on close modal
  useEffect(() => {
    if (isOpen) {
      resetStarknetTx()
    }
  }, [isOpen])

  // loading
  const loading = cardsQuery.loading

  const modalContent = useMemo(() => {
    if (loading) {
      return <PaginationSpinner loading />
    }

    if (cards.length) {
      return (
        <Column gap={'24'}>
          <TYPE.medium textAlign="center">
            <Trans>You need to migrate {cards.length} cards and packs to an external Starknet wallet.</Trans>
          </TYPE.medium>

          <StarknetStatus>
            <PrimaryButton onClick={handleMigration} large>
              <Trans>Migrate !</Trans>
            </PrimaryButton>
          </StarknetStatus>
        </Column>
      )
    }

    return (
      <TYPE.medium textAlign="center">
        <Trans>Nothing to migrate !</Trans>
      </TYPE.medium>
    )
  }, [loading, cards.length, handleMigration])

  if (!currentUser) return null

  return (
    <ClassicModal onDismiss={toggleMigrateCollectionModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleMigrateCollectionModal} title={signing ? undefined : t`Collection migration`} />

        <ModalBody>
          <StarknetSigner action={'transfer'}>{modalContent}</StarknetSigner>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
