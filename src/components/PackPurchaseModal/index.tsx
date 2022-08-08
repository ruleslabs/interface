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

  // error/success handlers
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

  // websocket
  const [wsClient, setWsClient] = useState<WebSocket | null>(null)
  useEffect(() => {
    if (!isOpen && wsClient) {
      wsClient.close()
      setWsClient(null)
    }

    if (!stripeClientSecret || !process.env.NEXT_PUBLIC_WS_URI || !isOpen) return

    const ws = wsClient ?? new WebSocket(process.env.NEXT_PUBLIC_WS_URI)
    if (!wsClient) setWsClient(ws)

    ws.onopen = () => {
      console.log('hey ws')
      const paymentIntentId = stripeClientSecret.match(/^pi_[a-zA-Z0-9]*/)?.[0]
      if (!paymentIntentId) return

      ws.send(
        JSON.stringify({
          action: 'subscribePaymentIntent',
          paymentIntentId,
        })
      )
    }

    ws.onmessage = (event) => {
      const data = event.data ? JSON.parse(event.data) : {}
      console.log('ws', data)
      if (data.error || data.success === false) onError(data.error ?? 'Unknown error')
      else onSuccess()
    }

    ws.onclose = (event) => {
      console.log('bye ws')
      setWsClient(null)
    }
  }, [setWsClient, wsClient, stripeClientSecret, onSuccess, onError, isOpen])

  // on retry
  const onRetry = useCallback(() => {
    wsClient?.close()
    setError(null)
    refreshPaymentIntent()
  }, [setError, refreshPaymentIntent, wsClient])

  // on close modal
  useEffect(() => {
    if (!isOpen) {
      setPaymentIntentInitialized(false)
      setStripeClientSecret(null)
    } else {
      setSuccess(false)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={togglePackPurchaseModal} isOpen={isOpen}>
      <StyledPackPurchaseModal gap={26}>
        <ModalHeader onDismiss={togglePackPurchaseModal}>
          {success ? (
            <div />
          ) : (
            <RowCenter gap={16}>
              <TYPE.large>
                <Trans>Secured Payment</Trans>
              </TYPE.large>
              <StyeldLock />
            </RowCenter>
          )}
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
              onError={onError}
            />
          </Elements>
        )}
      </StyledPackPurchaseModal>
    </Modal>
  )
}
