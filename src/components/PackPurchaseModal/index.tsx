import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Elements } from '@stripe/react-stripe-js'
import { t, Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Modal, { ModalHeader } from '@/components/Modal'
import { useModalOpen, usePackPurchaseModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import CheckoutForm from './checkoutForm'
import { useStripePromise } from '@/state/stripe/hooks'
import Column from '@/components/Column'

const StyledPackPurchaseModal = styled(Column)`
  width: 560px;
  padding: 16px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

interface PackPurchaseModalProps {
  stripeClientSecret: string | null
  paymentIntentError: boolean
  price: number
  quantity: number
  onSuccessfulPackPurchase: (boughtQuantity: number) => void
}

export default function PackPurchaseModal({
  stripeClientSecret,
  paymentIntentError,
  price,
  quantity,
  onSuccessfulPackPurchase,
}: PackPurchaseModalProps) {
  // success
  const [isSuccessful, setIsSuccessFul] = useState(false)
  const onSuccess = useCallback(() => {
    setIsSuccessFul(true)
    onSuccessfulPackPurchase(quantity)
  }, [setIsSuccessFul, onSuccessfulPackPurchase, quantity])

  // stripe
  const stripePromise = useStripePromise()

  // modal
  const isOpen = useModalOpen(ApplicationModal.PACK_PURCHASE)
  const togglePackPurchaseModal = usePackPurchaseModalToggle()

  useEffect(() => {
    if (isOpen) setIsSuccessFul(false)
  }, [isOpen])

  return (
    <Modal onDismiss={togglePackPurchaseModal} isOpen={isOpen}>
      <StyledPackPurchaseModal gap={26}>
        <ModalHeader onDismiss={togglePackPurchaseModal}>{t`Checkout`}</ModalHeader>
        {isSuccessful ? (
          <TYPE.body>
            <Trans>
              Your order has been received, you will receive a confirmation email once payment has been accepted.
            </Trans>
          </TYPE.body>
        ) : (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              stripeClientSecret={stripeClientSecret}
              paymentIntentError={paymentIntentError}
              amount={price * quantity}
              onSuccess={onSuccess}
            />
          </Elements>
        )}
      </StyledPackPurchaseModal>
    </Modal>
  )
}
