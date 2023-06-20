import { useCallback, useEffect } from 'react'
import { t, Trans } from '@lingui/macro'
import { gql, useQuery } from '@apollo/client'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import { useModalOpened, useCancelListingModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import StarknetSigner from 'src/components/StarknetSigner/Transaction'
import CardBreakdown from './CardBreakdown'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { useOperations } from 'src/hooks/usePendingOperations'
import { PaginationSpinner } from '../Spinner'

const CARDS_QUERY = gql`
  query CardsByTokenIds($tokenIds: [String!]!) {
    cardsByTokenIds(tokenIds: $tokenIds) {
      serialNumber
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
        artistName
        pictureUrl(derivative: "width=256")
        season
        scarcity {
          name
        }
      }
    }
  }
`

interface CancelListingModalProps {
  tokenId: string
}

export default function CancelListingModal({ tokenId }: CancelListingModalProps) {
  // modal
  const isOpen = useModalOpened(ApplicationModal.CANCEL_LISTING)
  const toggleCancelListingModal = useCancelListingModalToggle()

  // cards query
  const { data, loading } = useQuery(CARDS_QUERY, { variables: { tokenIds: [tokenId] }, skip: !isOpen })
  const card = (data?.cardsByTokenIds ?? [])[0]

  // pending operation
  const { pushOperation, cleanOperations } = useOperations()

  // starknet tx
  const { setCalls, resetStarknetTx, signing, setSigning } = useStarknetTx()

  // call
  const handleConfirmation = useCallback(() => {
    if (!card.listing) return

    // save operation
    pushOperation({ tokenId, action: 'offerCancelation', quantity: 1 })

    // save call
    setCalls([
      rulesSdk.getOrderCancelationCall(
        tokenId,
        1,
        card.listing.price,
        card.listing.orderSigningData.salt,
        card.listing.orderSigningData.signature
      ),
    ])

    setSigning(true)
  }, [card?.listing?.price, card?.listing?.orderSigningData, tokenId])

  // on close modal
  useEffect(() => {
    if (isOpen) {
      resetStarknetTx()
      cleanOperations()
    }
  }, [isOpen])

  return (
    <ClassicModal onDismiss={toggleCancelListingModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleCancelListingModal} title={signing ? undefined : t`Confirm offer cancelation`} />

        <ModalBody>
          <StarknetSigner action={'offerCancelation'}>
            <Column gap={32}>
              {card ? (
                <>
                  <CardBreakdown
                    pictureUrl={card.cardModel.pictureUrl}
                    season={card.cardModel.season}
                    artistName={card.cardModel.artistName}
                    serialNumbers={[card.serialNumber]}
                    scarcityName={card.cardModel.scarcity.name}
                  />

                  <PrimaryButton onClick={handleConfirmation} large>
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
