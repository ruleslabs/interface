import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Elements } from '@stripe/react-stripe-js'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Modal, { ModalHeader } from '@/components/Modal'
import { useModalOpen, usePackPurchaseModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import CheckoutForm from './checkoutForm'
import { useStripePromise, useCreatePaymentIntent } from '@/state/stripe/hooks'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import Confirmation from './Confirmation'
import Error from './Error'

import Lock from '@/images/lock.svg'

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

const StyeldLock = styled(Lock)`
  width: 16px;
`

interface PackPurchaseModalProps {
  price: number
  quantity: number
  onSuccessfulPackPurchase: (boughtQuantity: number) => void
  packId: string
  packName: string
}

export default function PackPurchaseModal({
  price,
  quantity,
  onSuccessfulPackPurchase,
  packId,
  packName,
}: PackPurchaseModalProps) {
  // modal
  const isOpen = useModalOpen(ApplicationModal.PACK_PURCHASE)
  const togglePackPurchaseModal = usePackPurchaseModalToggle()

  // stripe
  const stripePromise = useStripePromise()
  const [paymentIntentInitialized, setPaymentIntentInitialized] = useState(false)
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const [paymentIntentError, setPaymentIntentError] = useState(false)
  const createPaymentIntent = useCreatePaymentIntent()

  const refreshPaymentIntent = useCallback(() => {
    if (!isOpen) return

    setStripeClientSecret(null)
    setPaymentIntentInitialized(true)

    createPaymentIntent(packId, quantity)
      .catch((err) => {
        setPaymentIntentError(true) // TODO handle error
        console.error(err)
      })
      .then((data) => setStripeClientSecret(data?.clientSecret ?? null))
  }, [packId, createPaymentIntent, setPaymentIntentError, setStripeClientSecret, quantity, isOpen])

  useEffect(() => {
    if (!paymentIntentInitialized) refreshPaymentIntent()
  }, [refreshPaymentIntent, paymentIntentInitialized])

  // handlers
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onSuccess = useCallback(() => {
    setSuccess(true)
    onSuccessfulPackPurchase(quantity)
  }, [onSuccessfulPackPurchase, quantity, setSuccess])
  const onError = useCallback(
    (error: string) => {
      setError(error)
      console.error(error)
    },
    [setError]
  )
  const onRetry = useCallback(() => {
    setError(null)
    refreshPaymentIntent()
  }, [setError, refreshPaymentIntent])

  // on close modal
  useEffect(() => {
    if (!isOpen) {
      setPaymentIntentInitialized(false)
    } else {
      setSuccess(false)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={togglePackPurchaseModal} isOpen={isOpen}>
      <StyledPackPurchaseModal gap={26}>
        <ModalHeader onDismiss={togglePackPurchaseModal}>
          <RowCenter gap={16}>
            <TYPE.large>
              <Trans>Secured Payment</Trans>
            </TYPE.large>
            <StyeldLock />
          </RowCenter>
        </ModalHeader>
        {error ? (
          <Error error={error} onRetry={onRetry} />
        ) : success ? (
          <Confirmation packName={packName} amountPaid={price} />
        ) : (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              stripeClientSecret={stripeClientSecret}
              paymentIntentError={paymentIntentError}
              amount={price * quantity}
              onSuccess={onSuccess}
              onError={onError}
            />
          </Elements>
        )}
      </StyledPackPurchaseModal>
    </Modal>
  )
}
