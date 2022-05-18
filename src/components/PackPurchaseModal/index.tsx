import { useCallback } from 'react'
import styled from 'styled-components'
import { Elements } from '@stripe/react-stripe-js'
import { t } from '@lingui/macro'

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
`

interface PackPurchaseModalProps {
  stripeClientSecret: string | null
  paymentIntentError: boolean
  price: number
  quantity: number
}

export default function PackPurchaseModal({
  stripeClientSecret,
  paymentIntentError,
  price,
  quantity,
}: PackPurchaseModalProps) {
  // stripe
  const stripePromise = useStripePromise()

  // modal
  const isOpen = useModalOpen(ApplicationModal.PACK_PURCHASE)
  const togglePackPurchaseModal = usePackPurchaseModalToggle()
  const onDismiss = useCallback(() => {
    togglePackPurchaseModal()
  }, [togglePackPurchaseModal])

  return (
    <Modal onDismiss={onDismiss} isOpen={isOpen}>
      <StyledPackPurchaseModal gap={26}>
        <ModalHeader onDismiss={togglePackPurchaseModal}>{t`Checkout`}</ModalHeader>
        <Elements stripe={stripePromise}>
          <CheckoutForm
            stripeClientSecret={stripeClientSecret}
            paymentIntentError={paymentIntentError}
            amount={price * quantity}
          />
        </Elements>
      </StyledPackPurchaseModal>
    </Modal>
  )
}
