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

    setCalls([
      {
        contractAddress: ethAddress,
        entrypoint: 'increaseAllowance',
        calldata: [marketplaceAddress, price, 0],
      },
      ...serialNumbers.map((serialNumber) => {
        const tokenId = cardId.getStarknetCardId(
          artistName,
          season,
          constants.ScarcityName.indexOf(scarcityName),
          serialNumber
        )
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
