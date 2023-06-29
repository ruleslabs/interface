import React, { useCallback, useMemo, useState, useEffect } from 'react'
import styled, { DefaultTheme, useTheme } from 'styled-components/macro'
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'
import { Trans, t } from '@lingui/macro'

import Column from 'src/components/Column'
import Row, { RowCenter } from 'src/components/Row'
import { PrimaryButton } from 'src/components/Button'
import { TYPE } from 'src/styles/theme'
import { useValidatePaymentMethod, useConfirmPaymentIntent } from 'src/state/stripe/hooks'
import Checkbox from 'src/components/Checkbox'
import Link from 'src/components/Link'
import useCheckbox from 'src/hooks/useCheckbox'

import { ReactComponent as VisaIcon } from 'src/images/cardBrands/visa.svg'
import { ReactComponent as MastercardIcon } from 'src/images/cardBrands/mastercard.svg'
import { ReactComponent as UnknownCardIcon } from 'src/images/cardBrands/unknown.svg'
import { ReactComponent as UnionPayIcon } from 'src/images/cardBrands/unionpay.svg'
import { ReactComponent as DinersIcon } from 'src/images/cardBrands/diners.svg'
import { ReactComponent as AmexIcon } from 'src/images/cardBrands/amex.svg'
import { ReactComponent as DiscoverIcon } from 'src/images/cardBrands/discover.svg'
import { ReactComponent as JcbIcon } from 'src/images/cardBrands/jcb.svg'

const cardBrandToIcon = {
  visa: <VisaIcon />,
  mastercard: <MastercardIcon />,
  amex: <AmexIcon />,
  discover: <DiscoverIcon />,
  diners: <DinersIcon />,
  jcb: <JcbIcon />,
  unionpay: <UnionPayIcon />,
  unknown: <UnknownCardIcon />,
}

const Form = styled.form<{ isOpen: boolean }>`
  ${({ isOpen }) => !isOpen && 'display: none;'}
`

const StripeInputWrapper = styled(RowCenter)`
  padding: 12px;
  background: ${({ theme }) => theme.bg4};
  border-radius: 6px;
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
  const theme = useTheme() as DefaultTheme

  const options = useMemo(
    () => ({
      style: {
        base: {
          fontSize: '16px',
          backgroundColor: 'transparent',
          color: theme.text1,
          letterSpacing: '0.025em',
          fontFamily: 'Inter var, Helvetica',
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
    async (event) => {
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
        .then(async (res: any) => {
          if (!res?.paymentMethod?.id) {
            throw { error: 'Invalid payment method', raw: res }
          }

          return validatePaymentMethod(res.paymentMethod.id).catch((err) => {
            throw { error: err?.error?.message, raw: err }
          })
        })
        .then(async (res: any) => {
          if (!res?.paymentMethod) {
            throw { failure: 'An error has occured with your payment method', raw: res }
          }

          onConfirm()

          return confirmPaymentIntent(paymentIntent, res.paymentMethod).catch((err) => {
            throw { failure: err, raw: err }
          })
        })
        .then((res: any) => {
          if (res?.paymentIntent?.error) {
            throw { failure: res.error, raw: res }
          } else if (res?.paymentIntent?.next_action) {
            // Handle next action
            return stripe.handleCardAction(res.paymentIntent.client_secret).catch((err) => {
              throw { failure: err, raw: err }
            })
          } else {
            // confirm payment
            onSuccess()
            return
          }
        })
        .then((res: any) => {
          if (res?.paymentIntent?.error) throw { failure: res.paymentIntent.error?.message, raw: res }
          if (!res?.paymentIntent || !res.paymentIntent.payment_method) {
            throw { failure: res?.error?.message ?? 'Invalid card action response', raw: res }
          }

          // confirm payment after next action
          return confirmPaymentIntent(res.paymentIntent.id, res.paymentIntent.payment_method).catch((err) => {
            throw { failure: err, raw: err }
          })
        })
        .then((res: any) => {
          if (res?.paymentIntent?.status === 'succeeded') {
            onSuccess()
          } else {
            throw { failure: res?.error?.message ?? 'Invalid confirmation response after card action', raw: res }
          }
        })
        .catch((err) => {
          if (err?.error) {
            setError(err.error)
            setLoading(false)
          } else {
            const message =
              typeof err?.failure === 'string'
                ? err.failure
                : 'An error has occured while trying to confirm the payment.'

            onError(
              `${message}, please, give the following informations to the support: ${JSON.stringify(err?.raw ?? err)}`
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
                {cardBrandToIcon[cardBrand as keyof typeof cardBrandToIcon] ?? <UnknownCardIcon />}
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
            <TYPE.body color="error">
              <Trans id={error}>{error}</Trans>
            </TYPE.body>
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
                    terms and conditions
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
