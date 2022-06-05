import React, { useCallback, useMemo, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'
import { CreatePaymentMethodCardData } from '@stripe/stripe-js'
import { Trans, t } from '@lingui/macro'

import useTheme from '@/hooks/useTheme'
import Column from '@/components/Column'
import Row, { RowCenter } from '@/components/Row'
import { PrimaryButton } from '@/components/Button'
import { TYPE } from '@/styles/theme'
import { useValidatePaymentMethod } from '@/state/stripe/hooks'

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

interface CheckoutFormProps {
  stripeClientSecret: string | null
  paymentIntentError: boolean
  amount: number
  onSuccess: () => void
}

export default function CheckoutForm({ stripeClientSecret, paymentIntentError, amount, onSuccess }: CheckoutFormProps) {
  const [loading, setLoading] = useState(!stripeClientSecret)
  const [error, setError] = useState<string | null>(null)
  const [stripeElementsReady, setStripeElementsReady] = useState(false)

  useEffect(() => setLoading(!stripeClientSecret || !stripeElementsReady), [stripeClientSecret, stripeElementsReady])

  // stripe
  const stripe = useStripe()
  const elements = useElements()
  const validatePaymentMethod = useValidatePaymentMethod()

  // style
  const [cardBrand, setCardBrand] = useState<string>('unknown')
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

  const handleCardNumberReady = useCallback(() => setStripeElementsReady(true), [setStripeElementsReady])

  const confirmCardPayment = useCallback(
    (cardNumberElement: CreatePaymentMethodCardData['card']) => {
      stripe
        .confirmCardPayment(stripeClientSecret, {
          payment_method: {
            card: cardNumberElement,
          },
        })
        .then((result) => {
          setLoading(false) // TODO: handle error
          if (result.error) console.error(result.error)
          else onSuccess()
        })
    },
    [stripe, stripeClientSecret]
  )

  const handleCheckout = useCallback(
    async (event) => {
      event.preventDefault()
      if (!stripeClientSecret || !stripe || !elements) return

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
            setError('Failed to verify your payment method please try again')
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
    [stripe, elements, stripeClientSecret, setLoading, confirmCardPayment, setError]
  )

  const handleCardNumberInput = useCallback((event) => {
    setCardBrand(event.brand ?? 'unknown')
  }, [])

  return (
    <form onSubmit={handleCheckout}>
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
          {error && (
            <Trans id={error} render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>} />
          )}
        </Column>
        <PrimaryButton onClick={handleCheckout} disabled={loading || paymentIntentError} large>
          {paymentIntentError
            ? t`An error has occured`
            : loading
            ? 'Loading...'
            : t`Confirm - ${(amount / 100).toFixed(2)}€`}
        </PrimaryButton>
      </Column>
    </form>
  )
}
