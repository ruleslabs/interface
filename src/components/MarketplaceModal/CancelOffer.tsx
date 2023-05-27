import { useCallback, useEffect } from 'react'
import { t, Trans } from '@lingui/macro'
import { cardId, constants, uint256 } from '@rulesorg/sdk-core'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import { useModalOpened, useCancelOfferModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import useCurrentUser from 'src/hooks/useCurrentUser'
import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import { ErrorCard } from 'src/components/Card'
import LockedWallet from 'src/components/LockedWallet'
import StarknetSigner, { StarknetSignerDisplayProps } from 'src/components/StarknetSigner'
import CardBreakdown from './CardBreakdown'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { useOperations } from 'src/hooks/usePendingOperations'

const display: StarknetSignerDisplayProps = {
  confirmationText: t`Your offer will be canceled`,
  confirmationActionText: t`Confirm offer cancelation`,
  transactionText: t`offer cancelation.`,
}

interface CancelOfferModalProps {
  artistName: string
  season: number
  scarcityName: string
  serialNumber: number
  pictureUrl: string
}

export default function CancelOfferModal({
  artistName,
  season,
  scarcityName,
  serialNumber,
  pictureUrl,
}: CancelOfferModalProps) {
  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const isOpen = useModalOpened(ApplicationModal.CANCEL_OFFER)
  const toggleCancelOfferModal = useCancelOfferModalToggle()

  // pending operation
  const { pushOperation, cleanOperations } = useOperations()

  // starknet tx
  const { setCalls, resetStarknetTx, signing, setSigning } = useStarknetTx()

  // call
  const handleConfirmation = useCallback(() => {
    const marketplaceAddress = constants.MARKETPLACE_ADDRESSES[rulesSdk.networkInfos.starknetChainId]
    if (!marketplaceAddress) return

    const tokenId = cardId.getStarknetCardId(
      artistName,
      season,
      constants.ScarcityName.indexOf(scarcityName),
      serialNumber
    )
    const uint256TokenId = uint256.uint256HexFromStrHex(tokenId)

    // save operation
    pushOperation({ tokenId, type: 'offerCancelation', quantity: 1 })

    // save call
    setCalls([
      {
        contractAddress: marketplaceAddress,
        entrypoint: 'cancelOffer',
        calldata: [uint256TokenId.low, uint256TokenId.high],
      },
    ])

    setSigning(true)
  }, [artistName, season, scarcityName, serialNumber])

  // on close modal
  useEffect(() => {
    if (isOpen) {
      resetStarknetTx()
      cleanOperations()
    }
  }, [isOpen])

  return (
    <ClassicModal onDismiss={toggleCancelOfferModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleCancelOfferModal} title={signing ? undefined : t`Confirm offer cancelation`} />

        <ModalBody>
          <StarknetSigner display={display}>
            <Column gap={32}>
              <CardBreakdown
                pictureUrl={pictureUrl}
                season={season}
                artistName={artistName}
                serialNumbers={[serialNumber]}
                scarcityName={scarcityName}
              />

              {!!currentUser?.starknetWallet.lockingReason && (
                <ErrorCard>
                  <LockedWallet />
                </ErrorCard>
              )}

              <PrimaryButton onClick={handleConfirmation} disabled={!!currentUser?.starknetWallet.lockingReason} large>
                <Trans>Next</Trans>
              </PrimaryButton>
            </Column>
          </StarknetSigner>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
