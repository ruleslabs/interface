import React, { useCallback, useMemo, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'
import { CreatePaymentMethodCardData } from '@stripe/stripe-js'
import { Trans, t } from '@lingui/macro'
// import { w3cwebsocket as W3CWebSocket } from 'websocket'

import useTheme from '@/hooks/useTheme'
import Column from '@/components/Column'
import Row, { RowCenter } from '@/components/Row'
import { PrimaryButton } from '@/components/Button'
import { TYPE } from '@/styles/theme'
import { useValidatePaymentMethod } from '@/state/stripe/hooks'
import Checkbox from '@/components/Checkbox'
import Link from '@/components/Link'
import useCheckbox from '@/hooks/useCheckbox'
import Spinner from '@/components/Spinner'

import VisaIcon from '@/images/cardBrands/visa.svg'
import MastercardIcon from '@/images/cardBrands/mastercard.svg'
import UnkownCardIcon from '@/images/cardBrands/unkown.svg'
import UnionPayIcon from '@/images/cardBrands/unionpay.svg'
import DinersIcon from '@/images/cardBrands/diners.svg'
import AmexIcon from '@/images/cardBrands/amex.svg'
import DiscoverIcon from '@/images/cardBrands/discover.svg'
import JcbIcon from '@/images/cardBrands/jcb.svg'

const cardBrandToIcon = {
  visa: VisaIcon,
  mastercard: MastercardIcon,
  amex: AmexIcon,
  discover: DiscoverIcon,
  diners: DinersIcon,
  jcb: JcbIcon,
  unionpay: UnionPayIcon,
  unknown: UnkownCardIcon,
}

const Form = styled.form<{ $display: boolean }>`
  ${({ $display }) => !$display && 'display: none;'}
`

const StripeInputWrapper = styled(RowCenter)`
  padding: 8px;
  background: ${({ theme }) => theme.bg3}80;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.bg3};

  & div {
    width: 100%;
  }

  & svg {
    max-height: 19px;
    width: 32px;
  }
`

const StripeLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  div:first-child {
    margin-left: 8px;
  }
`

const Confirmation = styled(RowCenter)`
  justify-content: center;
  gap: 16px;
`

const StyledSpinner = styled(Spinner)`
  margin: 0;
  width: 24px;
`

interface CheckoutFormProps {
  stripeClientSecret: string | null
  paymentIntentError: boolean
  amount: number
  onSuccess: (tsHash: string) => void
  onError: (error: string) => void
}

export default function CheckoutForm({
  stripeClientSecret,
  paymentIntentError,
  amount,
  onSuccess,
  onError,
}: CheckoutFormProps) {
  const [loading, setLoading] = useState(!stripeClientSecret)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  // Stripe ready
  const [stripeElementsReady, setStripeElementsReady] = useState(false)
  const handleCardNumberReady = useCallback(() => setStripeElementsReady(true), [setStripeElementsReady])
  useEffect(() => setLoading(!stripeClientSecret || !stripeElementsReady), [stripeClientSecret, stripeElementsReady])

  // checkboxes
  const [acceptStripeTos, toggleStripeTosAgreed] = useCheckbox(false)
  const [acceptRightToRetract, toggleRightToRetractAgreed] = useCheckbox(false)

  // stripe
  const stripe = useStripe()
  const elements = useElements()
  const validatePaymentMethod = useValidatePaymentMethod()

  // style
  const [cardBrand, setCardBrand] = useState<string>('unknown')
  const handleCardNumberInput = useCallback((event) => {
    setCardBrand(event.brand ?? 'unknown')
  }, [])
  const theme = useTheme()

  const options = useMemo(
    () => ({
      style: {
        base: {
          fontSize: '16px',
          backgroundColor: 'transparent',
          color: theme.text1,
          letterSpacing: '0.025em',
          fontFamily: 'Source Code Pro, monospace',
          '::placeholder': {
            color: theme.text2,
          },
        },
        invalid: {
          color: theme.error,
        },
      },
    }),
    []
  )

  // stripe handler
  const confirmCardPayment = useCallback(
    (paymentMethodCardData: CreatePaymentMethodCardData['card']) => {
      setConfirming(true)
      stripe
        .confirmCardPayment(stripeClientSecret, {
          payment_method: {
            card: paymentMethodCardData,
          },
        })
        .catch((error) => {
          console.log(error)
        })
        .then((result) => {
          console.log(result)
          if (result.error) onError(`Stripe error: ${result.error.message}`)
        })
    },
    [stripe, stripeClientSecret, setConfirming, onError]
  )

  const handleCheckout = useCallback(
    async (event) => {
      event.preventDefault()
      if (!stripeClientSecret || !stripe || !elements) return

      if (!acceptStripeTos) {
        setError('You must accept the payment provider terms and conditions')
        return
      } else if (!acceptRightToRetract) {
        setError('You must accept the right to retract policy')
        return
      }

      setLoading(true)

      const cardNumberElement = elements.getElement(CardNumberElement)
      if (!cardNumberElement) {
        setLoading(false) // TODO: handle error
        return
      }

      stripe
        .createPaymentMethod({
          type: 'card',
          card: cardNumberElement,
        })
        .then((result: any) => {
          const paymentMethodId = result?.paymentMethod?.id
          if (!paymentMethodId) {
            setError('Invalid payment method')
            setLoading(false)
            return
          }

          validatePaymentMethod(paymentMethodId)
            .catch((err) => {
              setError(err?.error?.message ?? 'Failed to verify your payment method please try again')
              setLoading(false)
            })
            .then((data) => {
              if (data?.ok) confirmCardPayment(cardNumberElement)
              else setLoading(false)
            })
        })
    },
    [
      stripe,
      elements,
      stripeClientSecret,
      setLoading,
      setError,
      acceptStripeTos,
      acceptRightToRetract,
      confirmCardPayment,
    ]
  )

  // websocket
  const [wsClient, setWsClient] = useState<W3CWebSocket | null>(null)
  useEffect(() => {
    if (!stripeClientSecret) return

    const ws = wsClient ?? new WebSocket(process.env.NEXT_PUBLIC_WS_URI)
    if (!wsClient) setWsClient(ws)

    ws.onopen = (event) => {
      console.log('connect')
      const paymentIntentId = stripeClientSecret.match(/^pi_[a-zA-Z0-9]*/)[0]
      ws.send(
        JSON.stringify({
          action: 'subscribePaymentIntent',
          paymentIntentId,
        })
      )
    }

    ws.onmessage = (event) => {
      const data = event.data ? JSON.parse(event.data) : {}
      if (data.error || !data.txHash) onError(data.error)
      else onSuccess(data.txHash)
    }
  }, [setWsClient, wsClient, stripeClientSecret, onSuccess, onError])

  return (
    <>
      {confirming && (
        <Confirmation>
          <TYPE.body>
            <Trans>Payment being processed</Trans>
          </TYPE.body>
          <StyledSpinner />
        </Confirmation>
      )}
      <Form onSubmit={handleCheckout} $display={!confirming}>
        <Column gap={32}>
          <Column gap={16}>
            <StripeLabel>
              <TYPE.body>
                <Trans>Card Number</Trans>
              </TYPE.body>
              <StripeInputWrapper>
                <CardNumberElement options={options} onChange={handleCardNumberInput} onReady={handleCardNumberReady} />
                {(cardBrandToIcon[cardBrand as keyof typeof cardBrandToIcon] ?? UnkownCardIcon)()}
              </StripeInputWrapper>
            </StripeLabel>
            <Row gap={16}>
              <StripeLabel>
                <TYPE.body>
                  <Trans>Expiration</Trans>
                </TYPE.body>
                <StripeInputWrapper>
                  <CardExpiryElement options={options} />
                </StripeInputWrapper>
              </StripeLabel>
              <StripeLabel>
                <TYPE.body>CVC</TYPE.body>
                <StripeInputWrapper>
                  <CardCvcElement options={options} />
                </StripeInputWrapper>
              </StripeLabel>
            </Row>
          </Column>

          {error && (
            <Trans id={error} render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>} />
          )}

          <Column gap={12}>
            <Checkbox value={acceptStripeTos} onChange={toggleStripeTosAgreed}>
              <TYPE.body>
                <Trans>
                  I acknowledge having read and accepted the&nbsp;
                  <Link href="https://stripe.com/fr/legal/checkout" underline>
                    terms and conditions
                  </Link>
                  <span>&nbsp;</span>
                  of Stripe.
                </Trans>
              </TYPE.body>
            </Checkbox>
            <Checkbox value={acceptRightToRetract} onChange={toggleRightToRetractAgreed}>
              <TYPE.body>
                <Trans>
                  I expressly agree that your services will be provided to me upon my acceptance of the Terms and
                  Conditions and I waive my right of retract.
                </Trans>
              </TYPE.body>
            </Checkbox>
          </Column>
          <PrimaryButton onClick={handleCheckout} disabled={loading || paymentIntentError} large>
            {paymentIntentError
              ? t`An error has occured`
              : loading
              ? 'Loading...'
              : t`Confirm - ${(amount / 100).toFixed(2)}€`}
          </PrimaryButton>
        </Column>
      </Form>
    </>
  )
}
