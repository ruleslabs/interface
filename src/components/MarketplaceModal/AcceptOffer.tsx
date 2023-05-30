import { useCallback, useEffect, useMemo } from 'react'
import { t, Trans } from '@lingui/macro'
import { WeiAmount, cardId, constants, uint256 } from '@rulesorg/sdk-core'

import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import { useModalOpened, useAcceptOfferModalToggle, useWalletModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import useCurrentUser from 'src/hooks/useCurrentUser'
import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import { ErrorCard } from 'src/components/Card'
import LockedWallet from 'src/components/LockedWallet'
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

const display: StarknetSignerDisplayProps = {
  confirmationText: t`Your purchase will be accepted`,
  confirmationActionText: t`Confirm purchase`,
  transactionText: t`offer acceptance.`,
}

interface AcceptOfferModalProps {
  artistName: string
  season: number
  scarcityName: string
  serialNumbers: number[]
  pictureUrl: string
  price: string
}

export default function AcceptOfferModal({
  artistName,
  season,
  scarcityName,
  serialNumbers,
  pictureUrl,
  price,
}: AcceptOfferModalProps) {
  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const isOpen = useModalOpened(ApplicationModal.ACCEPT_OFFER)
  const toggleAcceptOfferModal = useAcceptOfferModalToggle()
  const toggleWalletModal = useWalletModalToggle()

  // pending operation
  const { pushOperation, cleanOperations } = useOperations()

  // starknet tx
  const { setCalls, resetStarknetTx, signing, setSigning } = useStarknetTx()

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

    let scarcityIndex = -1

    for (const [index, scarcity] of constants.Seasons[season].entries()) {
      if (scarcity.name === scarcityName) {
        scarcityIndex = index
        break
      }
    }

    if (scarcityIndex < 0) return

    const tokenIds = serialNumbers.map((serialNumber) =>
      cardId.getStarknetCardId(artistName, season, scarcityIndex, serialNumber)
    )

    // save operations
    pushOperation(...tokenIds.map((tokenId): Operation => ({ tokenId, type: 'offerAcceptance', quantity: 1 })))

    // save calls
    setCalls([
      {
        contractAddress: ethAddress,
        entrypoint: 'increaseAllowance',
        calldata: [marketplaceAddress, price, 0],
      },
      ...tokenIds.map((tokenId) => {
        const uint256TokenId = uint256.uint256HexFromStrHex(tokenId)

        return {
          contractAddress: marketplaceAddress,
          entrypoint: 'acceptOffer',
          calldata: [uint256TokenId.low, uint256TokenId.high],
        }
      }),
    ])

    setSigning(true)
  }, [artistName, season, scarcityName, serialNumbers.length])

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
              <CardBreakdown
                pictureUrl={pictureUrl}
                season={season}
                artistName={artistName}
                serialNumbers={serialNumbers}
                scarcityName={scarcityName}
              />

              <PurchaseBreakdown price={price} />

              {!!currentUser?.starknetWallet.lockingReason && (
                <ErrorCard>
                  <LockedWallet />
                </ErrorCard>
              )}

              {!canPayForCard && balance && (
                <ErrorCard textAlign="center">
                  <Trans>
                    You do not have enough ETH in your Rules wallet to purchase this card.
                    <br />
                    <span onClick={toggleWalletModal}>Buy ETH or deposit from another wallet.</span>
                  </Trans>
                </ErrorCard>
              )}

              <PrimaryButton
                onClick={handleConfirmation}
                disabled={!!currentUser?.starknetWallet.lockingReason || !canPayForCard}
                large
              >
                <Trans>Next</Trans>
              </PrimaryButton>
            </Column>
          </StarknetSigner>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
