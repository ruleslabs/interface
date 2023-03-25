import { useCallback, useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { t } from '@lingui/macro'

import { ModalHeader } from '@/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from '@/components/Modal/Classic'
import { useModalOpened, usePackPurchaseModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useStripePromise, useCreatePaymentIntent } from '@/state/stripe/hooks'
import CheckoutForm from './CheckoutForm'
import Confirmation from './Confirmation'

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
  const isOpen = useModalOpened(ApplicationModal.PACK_PURCHASE)
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
    <ClassicModal onDismiss={togglePackPurchaseModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={togglePackPurchaseModal} title={t`Secured Payment`} />

        <ModalBody>
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
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
