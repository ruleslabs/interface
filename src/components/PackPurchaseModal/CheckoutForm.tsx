import React, { useCallback, useMemo, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'
import { Trans, t } from '@lingui/macro'

import useTheme from '@/hooks/useTheme'
import Column from '@/components/Column'
import Row, { RowCenter } from '@/components/Row'
import { PrimaryButton } from '@/components/Button'
import { TYPE } from '@/styles/theme'
import { useValidatePaymentMethod, useConfirmPaymentIntent } from '@/state/stripe/hooks'
import Checkbox from '@/components/Checkbox'
import Link from '@/components/Link'
import useCheckbox from '@/hooks/useCheckbox'
import Spinner from '@/components/Spinner'

import VisaIcon from '@/images/cardBrands/visa.svg'
import MastercardIcon from '@/images/cardBrands/mastercard.svg'
import UnknownCardIcon from '@/images/cardBrands/unknown.svg'
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
  unknown: UnknownCardIcon,
}

const Form = styled.form<{ isOpen: boolean }>`
  ${({ isOpen }) => !isOpen && 'display: none;'}
`

const StripeInputWrapper = styled(RowCenter)`
  padding: 12px;
  background: ${({ theme }) => theme.bg5};
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.bg3};

  & div {
    width: 100%;
  }

  & svg {
    height: 28px;
  }
`

const StripeLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  & div:first-child {
    margin-left: 4px;
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
  isOpen: boolean
  paymentIntent: string | null
  paymentIntentError: boolean
  amount: number
  onError: (error: string) => void
  onConfirm: () => void
  onSuccess: () => void
}

export default function CheckoutForm({
  isOpen,
  paymentIntent,
  paymentIntentError,
  amount,
  onError,
  onConfirm,
  onSuccess,
}: CheckoutFormProps) {
  const [loading, setLoading] = useState(!paymentIntent)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  // Stripe ready
  const [stripeElementsReady, setStripeElementsReady] = useState(false)
  const handleCardNumberReady = useCallback(() => setStripeElementsReady(true), [setStripeElementsReady])
  useEffect(() => setLoading(!paymentIntent || !stripeElementsReady), [paymentIntent, stripeElementsReady])

  // checkboxes
  const [acceptStripeTos, toggleStripeTosAgreed] = useCheckbox(false)
  const [acceptRightToRetract, toggleRightToRetractAgreed] = useCheckbox(false)

  // stripe
  const stripe = useStripe()
  const elements = useElements()
  const validatePaymentMethod = useValidatePaymentMethod()
  const confirmPaymentIntent = useConfirmPaymentIntent()

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
          fontFamily: 'Roboto, Helvetica',
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

  const handleCheckout = useCallback(
    (event) => {
      event.preventDefault()
      if (!paymentIntent || !stripe || !elements) return

      if (!acceptStripeTos) {
        setError("You must accept Stripe's terms and conditions")
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
        .then((res: any) => {
          if (!res?.paymentMethod?.id) throw { error: 'Invalid payment method' }

          return validatePaymentMethod(res.paymentMethod.id).catch((err) => {
            throw { error: err?.error?.message }
          })
        })
        .then((res: any) => {
          if (!res?.paymentMethod) throw { failure: 'An error has occured with your payment method' }

          onConfirm()

          return confirmPaymentIntent(paymentIntent, res.paymentMethod).catch((err) => {
            throw { failure: err }
          })
        })
        .then((res: any) => {
          if (res?.paymentIntent?.error) {
            throw { failure: res.error }
          } else if (res?.paymentIntent?.next_action) {
            // Handle next action
            return stripe.handleCardAction(res.paymentIntent.client_secret).catch((err) => {
              throw err
            })
          } else {
            // confirm payment
            onSuccess()
            return
          }

          console.log(res)
          throw { failure: res?.error?.message ?? 'Invalid response after confirmation' }
        })
        .then((res: any) => {
          if (res?.paymentIntent?.error) throw { failure: res.paymentIntent.error?.message }
          if (!res?.paymentIntent || !res.paymentIntent.payment_method) {
            console.log(res)
            throw { failure: res?.error?.message ?? 'Invalid card action response' }
          }

          // confirm payment after next action
          return confirmPaymentIntent(res.paymentIntent.id, res.paymentIntent.payment_method).catch((err) => {
            throw { failure: err }
          })
        })
        .then((res: any) => {
          if (res?.paymentIntent?.status === 'succeeded') onSuccess()
          else {
            console.log(res)
            throw { failure: res?.error?.message ?? 'Invalid confirmation response after card action' }
          }
        })
        .catch((err) => {
          console.error(err)

          if (err?.error) {
            setError(err.error)
            setLoading(false)
          } else {
            onError(
              typeof err?.failure === 'string'
                ? err.failure
                : 'An error has occured while trying to confirm the payment'
            )
          }
        })
    },
    [stripe, elements, paymentIntent, acceptStripeTos, acceptRightToRetract, confirmPaymentIntent, onConfirm]
  )

  return (
    <>
      <Form onSubmit={handleCheckout} isOpen={isOpen}>
        <Column gap={32}>
          <Column gap={16}>
            <StripeLabel>
              <TYPE.body>
                <Trans>Card Number</Trans>
              </TYPE.body>

              <StripeInputWrapper>
                <CardNumberElement options={options} onChange={handleCardNumberInput} onReady={handleCardNumberReady} />
                {(cardBrandToIcon[cardBrand as keyof typeof cardBrandToIcon] ?? UnknownCardIcon)()}
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
                <TYPE.body>
                  <Trans>Security code</Trans>
                </TYPE.body>

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
                  <Link href="https://stripe.com/fr/legal/checkout" target="_blank" underline>
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
                  I expressly agree that your services will be provided to me upon my acceptance of the&nbsp;
                  <Link href="/terms" target="_blank" underline>
                    Terms and Conditions
                  </Link>
                  <span>&nbsp;</span>
                  and I waive my right of retract.
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
