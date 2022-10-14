import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Elements } from '@stripe/react-stripe-js'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Modal, { ModalHeader } from '@/components/Modal'
import { useModalOpen, usePackPurchaseModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useStripePromise, useCreatePaymentIntent } from '@/state/stripe/hooks'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import CheckoutForm from './CheckoutForm'
import Confirmation from './Confirmation'

import Lock from '@/images/lock.svg'

const StyledPackPurchaseModal = styled(Column)`
  width: 560px;
  padding: 26px;
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

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // processing
  const [processing, setProcessing] = useState(false)
  const onConfirm = useCallback(() => setProcessing(true), [])

  // stripe
  const stripePromise = useStripePromise()
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null)
  const [paymentIntentError, setPaymentIntentError] = useState(false)
  const createPaymentIntent = useCreatePaymentIntent()

  const refreshPaymentIntent = useCallback(() => {
    if (!isOpen) return

    setPaymentIntent(null)

    createPaymentIntent(packId, quantity)
      .then((res) => setPaymentIntent(res?.paymentIntent?.id ?? null))
      .catch((err) => {
        setPaymentIntentError(true) // TODO handle error
        console.error(err)
      })
  }, [packId, createPaymentIntent, quantity, isOpen])

  useEffect(() => {
    if (!paymentIntent) refreshPaymentIntent()
  }, [refreshPaymentIntent, paymentIntent])

  // success
  const [success, setSuccess] = useState(false)
  const onSuccess = useCallback(() => {
    setSuccess(true)
    onSuccessfulPackPurchase(quantity)
  }, [onSuccessfulPackPurchase, quantity])

  // on retry
  const onRetry = useCallback(() => {
    setError(null)
    setProcessing(false)
    refreshPaymentIntent()
  }, [refreshPaymentIntent])

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setPaymentIntentError(false)
      setPaymentIntent(null)
      setSuccess(false)
      setError(null)
      setProcessing(false)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={togglePackPurchaseModal} isOpen={isOpen}>
      <StyledPackPurchaseModal gap={26}>
        <ModalHeader onDismiss={togglePackPurchaseModal} onBack={error ? onRetry : undefined}>
          {!success && !error && !processing && (
            <RowCenter gap={16}>
              <TYPE.large>
                <Trans>Secured Payment</Trans>
              </TYPE.large>
              <StyeldLock />
            </RowCenter>
          )}
        </ModalHeader>

        {(!!error || success || processing) && (
          <Confirmation packName={packName} amountPaid={price} error={error ?? undefined} success={success} />
        )}

        <Elements stripe={stripePromise}>
          <CheckoutForm
            isOpen={!success && !error && !processing}
            paymentIntent={paymentIntent}
            paymentIntentError={paymentIntentError}
            amount={price * quantity}
            onError={onError}
            onConfirm={onConfirm}
            onSuccess={onSuccess}
          />
        </Elements>
      </StyledPackPurchaseModal>
    </Modal>
  )
}
