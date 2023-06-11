import { useCallback, useEffect, useMemo } from 'react'
import { t, Trans } from '@lingui/macro'
import { WeiAmount, constants } from '@rulesorg/sdk-core'
import { gql, useQuery } from '@apollo/client'

import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import { useModalOpened, useAcceptOfferModalToggle, useWalletModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import { ErrorCard } from 'src/components/Card'
import StarknetSigner, { StarknetSignerDisplayProps } from 'src/components/StarknetSigner'
import { useETHBalance } from 'src/state/wallet/hooks'
import { PurchaseBreakdown } from './PriceBreakdown'
import CardBreakdown from './CardBreakdown'
import { ModalHeader } from 'src/components/Modal'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import useRulesAccount from 'src/hooks/useRulesAccount'
import { useOperations } from 'src/hooks/usePendingOperations'
import { Operation } from 'src/types'
import { Call, uint256 } from 'starknet'
import { getVoucherRedeemCall } from 'src/utils/getVoucherRedeemCall'

const CARDS_QUERY = gql`
  query CardsByTokenIds($tokenIds: [String!]!) {
    cardsByTokenIds(tokenIds: $tokenIds) {
      serialNumber
      tokenId
      owner {
        starknetAddress
      }
      voucherSigningData {
        signature {
          r
          s
        }
        nonce
      }
      cardModel {
        pictureUrl(derivative: "width=256")
        season
        scarcity {
          name
        }
        artistName
      }
    }
  }
`

const display: StarknetSignerDisplayProps = {
  confirmationText: t`Your purchase will be accepted`,
  confirmationActionText: t`Confirm purchase`,
  transactionText: t`offer acceptance.`,
}

interface AcceptOfferModalProps {
  tokenIds: string[]
  price: string
}

export default function AcceptOfferModal({ tokenIds, price }: AcceptOfferModalProps) {
  // modal
  const isOpen = useModalOpened(ApplicationModal.ACCEPT_OFFER)
  const toggleAcceptOfferModal = useAcceptOfferModalToggle()
  const toggleWalletModal = useWalletModalToggle()

  // cards query
  const cardsQuery = useQuery(CARDS_QUERY, { variables: { tokenIds }, skip: !isOpen })
  const cards = cardsQuery.data?.cardsByTokenIds ?? []
  const cardModel = cards[0]?.cardModel // TODO: support multiple card models

  // serial numbers
  const serialNumbers = useMemo(() => cards.map((card: any) => card.serialNumber), [cards.length])

  // voucher signing data map
  const vouchersSigningDataMap = useMemo(
    () =>
      (cards as any[]).reduce<any>((acc, card) => {
        acc[card.tokenId] = { voucherSigningData: card.voucherSigningData, owner: card.owner.starknetAddress }
        return acc
      }, {}),
    [cards.length]
  )

  // pending operation
  const { pushOperation, cleanOperations } = useOperations()

  // starknet tx
  const { pushCalls, resetStarknetTx, signing, setSigning } = useStarknetTx()

  // starknet account
  const { address } = useRulesAccount()

  // can pay for card
  const balance = useETHBalance(address)
  const canPayForCard = useMemo(() => {
    if (!balance) return true // we avoid displaying error message if not necessary

    return !balance.lessThan(WeiAmount.fromRawAmount(price))
  }, [balance, price])

  // call
  const handleConfirmation = useCallback(() => {
    const ethAddress = constants.ETH_ADDRESSES[rulesSdk.networkInfos.starknetChainId]
    const marketplaceAddress = constants.MARKETPLACE_ADDRESSES[rulesSdk.networkInfos.starknetChainId]
    if (!ethAddress || !marketplaceAddress) return

    // save operations
    pushOperation(...tokenIds.map((tokenId): Operation => ({ tokenId, type: 'offerAcceptance', quantity: 1 })))

    const voucherRedeemCalls = tokenIds
      .map((tokenId) =>
        vouchersSigningDataMap[tokenId].voucherSigningData
          ? getVoucherRedeemCall(
              vouchersSigningDataMap[tokenId].owner,
              tokenId,
              1,
              vouchersSigningDataMap[tokenId].voucherSigningDataMap
            )
          : null
      )
      .filter((call): call is Call => !!call)

    // save calls
    pushCalls(
      {
        contractAddress: ethAddress,
        entrypoint: 'increaseAllowance',
        calldata: [marketplaceAddress, price, 0],
      },
      ...voucherRedeemCalls,
      ...tokenIds.map((tokenId) => {
        const u256TokenId = uint256.bnToUint256(tokenId)

        return {
          contractAddress: marketplaceAddress,
          entrypoint: 'acceptOffer',
          calldata: [u256TokenId.low, u256TokenId.high],
        }
      })
    )

    setSigning(true)
  }, [tokenIds.length, vouchersSigningDataMap])

  // on close modal
  useEffect(() => {
    if (isOpen) {
      resetStarknetTx()
      cleanOperations()
    }
  }, [isOpen])

  return (
    <ClassicModal onDismiss={toggleAcceptOfferModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleAcceptOfferModal} title={signing ? undefined : t`Confirm purchase`} />

        <ModalBody>
          <StarknetSigner display={display}>
            <Column gap={32}>
              {cardModel && (
                <CardBreakdown
                  pictureUrl={cardModel.pictureUrl}
                  season={cardModel.season}
                  artistName={cardModel.artistName}
                  serialNumbers={serialNumbers}
                  scarcityName={cardModel.scarcity.name}
                />
              )}

              <PurchaseBreakdown price={price} />

              {!canPayForCard && balance && (
                <ErrorCard textAlign="center">
                  <Trans>
                    You do not have enough ETH in your Rules wallet to purchase this card.
                    <br />
                    <span onClick={toggleWalletModal}>Buy ETH or deposit from another wallet.</span>
                  </Trans>
                </ErrorCard>
              )}

              <PrimaryButton onClick={handleConfirmation} disabled={!canPayForCard} large>
                <Trans>Next</Trans>
              </PrimaryButton>
            </Column>
          </StarknetSigner>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
