import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'

import useTheme from '@/hooks/useTheme'
import Column from '@/components/Column'
import Row, { RowCenter } from '@/components/Row'
import { PrimaryButton } from '@/components/Button'
import { TYPE } from '@/styles/theme'

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
    max-height: 20px;
    width: 32px;
  }
`

const StripeLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`

interface CheckoutFormProps {
  stripeClientSecret: string | null
  amount: number
}

export default function CheckoutForm({ stripeClientSecret, amount }: CheckoutFormProps) {
  // stripe
  const stripe = useStripe()
  const elements = useElements()

  // style
  const [cardBrand, setCardBrand] = useState<string>('unknown')
  const theme = useTheme()

  const options = useMemo(
    () => ({
      style: {
        base: {
          width: '100%',
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
          color: theme.red,
        },
      },
    }),
    []
  )

  const handleCheckout = useCallback(
    (event) => {
      event.preventDefault()
      if (!stripeClientSecret) return

      const cardElement = elements.getElement(CardElement)

      stripe.createToken(cardElement)
      stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })
      stripe.confirmCardPayment(stripeClientSecret, {
        payment_method: {
          card: cardElement,
        },
      })
    },
    [stripe, elements, stripeClientSecret]
  )

  const handleCardNumberInput = useCallback((event) => {
    console.log(event.brand)
    setCardBrand(event.brand ?? 'unknown')
  }, [])

  return (
    <form onSubmit={handleCheckout}>
      <Column gap={32}>
        <Column gap={16}>
          <StripeLabel>
            <TYPE.body>Card Number</TYPE.body>
            <StripeInputWrapper>
              <CardNumberElement width="100%" onChange={handleCardNumberInput} options={options} />
              {(cardBrandToIcon[cardBrand] ?? UnkownCardIcon)()}
            </StripeInputWrapper>
          </StripeLabel>
          <Row gap={16}>
            <StripeLabel>
              <TYPE.body>Expiration</TYPE.body>
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
        <PrimaryButton onClick={handleCheckout} large>
          Acheter - {(amount / 100).toFixed(2)}€
        </PrimaryButton>
      </Column>
    </form>
  )
}
