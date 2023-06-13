import { useCallback, useEffect } from 'react'
import { t, Trans } from '@lingui/macro'
import { constants, encode, tokens } from '@rulesorg/sdk-core'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import { useModalOpened, useCancelOfferModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import StarknetSigner from 'src/components/StarknetSigner'
import CardBreakdown from './CardBreakdown'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { useOperations } from 'src/hooks/usePendingOperations'

interface CancelOfferModalProps {
  artistName: string
  season: number
  scarcityName: string
  scarcityId: number
  serialNumber: number
  pictureUrl: string
}

export default function CancelOfferModal({
  artistName,
  season,
  scarcityName,
  serialNumber,
  scarcityId,
  pictureUrl,
}: CancelOfferModalProps) {
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

    const u256TokenId = tokens.getCardTokenId({ artistName, season, scarcityId, serialNumber })

    // save operation
    pushOperation({ tokenId: encode.encodeUint256(u256TokenId), action: 'offerCancelation', quantity: 1 })

    // save call
    setCalls([
      {
        contractAddress: marketplaceAddress,
        entrypoint: 'cancelOffer',
        calldata: [u256TokenId.low, u256TokenId.high],
      },
    ])

    setSigning(true)
  }, [artistName, season, scarcityId, serialNumber])

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
          <StarknetSigner action={'offerCancelation'}>
            <Column gap={32}>
              <CardBreakdown
                pictureUrl={pictureUrl}
                season={season}
                artistName={artistName}
                serialNumbers={[serialNumber]}
                scarcityName={scarcityName}
              />

              <PrimaryButton onClick={handleConfirmation} large>
                <Trans>Next</Trans>
              </PrimaryButton>
            </Column>
          </StarknetSigner>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
