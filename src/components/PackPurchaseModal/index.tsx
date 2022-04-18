import { useCallback } from 'react'
import styled from 'styled-components'
import { Elements } from '@stripe/react-stripe-js'

import Modal from '@/components/Modal'
import { useModalOpen, usePackPurchaseModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { TYPE } from '@/styles/theme'
import CheckoutForm from './checkoutForm'
import { useStripePromise } from '@/state/stripe/hooks'

const StyledPackPurchaseModal = styled.div`
  width: 560px;
  padding: 16px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;
`

interface PackPurchaseModalProps {
  stripeClientSecret: string | null
  amount: number
}

export default function PackPurchaseModal({ stripeClientSecret, amount }: PackPurchaseModalProps) {
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
      <StyledPackPurchaseModal>
        <TYPE.medium textAlign="center">PAY ME 🥸</TYPE.medium>
        <Elements stripe={stripePromise}>
          <CheckoutForm stripeClientSecret={stripeClientSecret} amount={amount} />
        </Elements>
      </StyledPackPurchaseModal>
    </Modal>
  )
}
