import { useCallback, useEffect, useMemo } from 'react'
import { t, Trans } from '@lingui/macro'
import { Unit, WeiAmount, constants } from '@rulesorg/sdk-core'
import { gql, useQuery } from '@apollo/client'

import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import { useModalOpened, useAcceptOfferModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import StarknetSigner from 'src/components/StarknetSigner/Transaction'
import { useETHBalance } from 'src/state/wallet/hooks'
import { PurchaseBreakdown } from './PriceBreakdown'
import CardBreakdown from './CardBreakdown'
import { ModalHeader } from 'src/components/Modal'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import useRulesAccount from 'src/hooks/useRulesAccount'
import { useOperations } from 'src/hooks/usePendingOperations'
import { Operation } from 'src/types'
import DepositNeeded from '../LockedWallet/DepositNeeded'
import { PaginationSpinner } from '../Spinner'

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
        salt
      }
      listing {
        price
        orderSigningData {
          signature {
            r
            s
          }
          salt
        }
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

interface AcceptOfferModalProps {
  tokenIds: string[]
}

export default function AcceptOfferModal({ tokenIds }: AcceptOfferModalProps) {
  // modal
  const isOpen = useModalOpened(ApplicationModal.ACCEPT_OFFER)
  const toggleAcceptOfferModal = useAcceptOfferModalToggle()

  // cards query
  const { data, loading } = useQuery(CARDS_QUERY, { variables: { tokenIds }, skip: !isOpen })
  const cards: any[] = data?.cardsByTokenIds ?? []
  const cardModel = cards[0]?.cardModel // TODO: support multiple card models

  // serial numbers
  const serialNumbers = useMemo(() => cards.map((card: any) => card.serialNumber), [cards.length])

  // price total
  const parsedTotalPrice = useMemo(
    () => cards.reduce<WeiAmount>((acc, { listing }) => acc.add(listing.price), WeiAmount.ZERO),
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

    return !balance.lessThan(parsedTotalPrice)
  }, [balance, parsedTotalPrice])

  // call
  const handleConfirmation = useCallback(() => {
    // save operations
    pushOperation(...cards.map(({ tokenId }): Operation => ({ tokenId, action: 'offerAcceptance', quantity: 1 })))

    // save calls
    pushCalls(
      {
        contractAddress: constants.ETH_ADDRESSES[rulesSdk.networkInfos.starknetChainId],
        entrypoint: 'increaseAllowance',
        calldata: [
          constants.MARKETPLACE_ADDRESSES[rulesSdk.networkInfos.starknetChainId],
          parsedTotalPrice.toUnitFixed(Unit.WEI),
          0,
        ],
      },
      ...cards.map((card) =>
        card.voucherSigningData
          ? rulesSdk.getVoucherReedemAndOrderFulfillCall(
              card.owner.starknetAddress,
              card.tokenId,
              1,
              card.listing.price,
              card.voucherSigningData.salt,
              card.voucherSigningData.signature,
              card.listing.orderSigningData.salt,
              card.listing.orderSigningData.signature
            )
          : rulesSdk.getOrderFulfillCall(
              card.owner.starknetAddress,
              card.tokenId,
              1,
              card.listing.price,
              card.listing.orderSigningData.salt,
              card.listing.orderSigningData.signature
            )
      )
    )

    setSigning(true)
  }, [cards.length, parsedTotalPrice])

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
          <StarknetSigner action={'offerAcceptance'}>
            <Column gap={32}>
              {cardModel ? (
                <>
                  <CardBreakdown
                    pictureUrl={cardModel.pictureUrl}
                    season={cardModel.season}
                    artistName={cardModel.artistName}
                    serialNumbers={serialNumbers}
                    scarcityName={cardModel.scarcity.name}
                  />

                  <PurchaseBreakdown price={parsedTotalPrice.toUnitFixed(Unit.WEI)} />

                  {!canPayForCard && balance && <DepositNeeded />}

                  <PrimaryButton onClick={handleConfirmation} disabled={!canPayForCard} large>
                    <Trans>Next</Trans>
                  </PrimaryButton>
                </>
              ) : (
                <PaginationSpinner loading={loading} />
              )}
            </Column>
          </StarknetSigner>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
