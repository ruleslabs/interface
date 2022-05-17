import 'moment/locale/fr'

import { useMemo, useCallback, useState } from 'react'
import moment from 'moment'
import { Plural, Trans, t } from '@lingui/macro'

import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Placeholder from '@/components/Placeholder'
import { useCreatePaymentIntent } from '@/state/stripe/hooks'
import PackPurchaseModal from '@/components/PackPurchaseModal'
import { usePackPurchaseModalToggle } from '@/state/application/hooks'
import InputStepCounter from '@/components/Input/StepCounter'
import { useActiveLocale } from '@/hooks/useActiveLocale'

interface PackBreakdownProps {
  name: string
  id: string
  seasons: number[]
  cardsPerPack: number
  price: number
  releaseDate?: Date
  availableSupply?: number
  availableQuantity?: number
}

export default function PackBreakdown({
  name,
  id,
  seasons,
  cardsPerPack,
  price,
  releaseDate,
  availableSupply,
  availableQuantity,
}: PackBreakdownProps) {
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const [paymentIntentError, setPaymentIntentError] = useState(false)
  const togglePackPurchaseModal = usePackPurchaseModalToggle()
  const locale = useActiveLocale()

  const released = releaseDate ? +releaseDate - +new Date() <= 0 : true

  const releaseDateFormatted = useMemo(() => {
    if (released) return null

    const releaseMoment = moment(releaseDate)
    releaseMoment.locale(locale)

    return releaseMoment.format('dddd D MMMM LT')
  }, [released, releaseDate, locale])

  const createPaymentIntent = useCreatePaymentIntent()

  const purchasePack = useCallback(async () => {
    setStripeClientSecret(null)
    togglePackPurchaseModal()

    createPaymentIntent(id, 1)
      .catch((err) => {
        setPaymentIntentError(true)
        console.error(err)
      })
      .then((data) => setStripeClientSecret(data?.clientSecret ?? null))
  }, [id, createPaymentIntent, setPaymentIntentError, setStripeClientSecret])

  const [quantity, setQuantity] = useState(1)
  const incrementQuantity = useCallback(() => setQuantity(quantity + 1), [quantity, setQuantity])
  const decrementQuantity = useCallback(() => setQuantity(quantity - 1), [quantity, setQuantity])

  return (
    <>
      <Column gap={28}>
        <Column gap={8}>
          <Trans
            id={name}
            render={({ translation }) => (
              <TYPE.body fontWeight={700} fontSize={28}>
                {translation}
              </TYPE.body>
            )}
          />
          <TYPE.body>
            <Plural value={seasons.length} _1="Season" other="Seasons" />
            {seasons.map((season, index) => `${index > 0 ? ', ' : ' '}${season}`)}
          </TYPE.body>
          <TYPE.body>
            <Plural value={cardsPerPack} _1="Includes {cardsPerPack} card" other="Includes {cardsPerPack} cards" />
          </TYPE.body>
        </Column>
        {released && (availableSupply === undefined || availableSupply > 0) && availableQuantity ? (
          <Column gap={12}>
            <InputStepCounter
              value={quantity}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              min={1}
              max={availableQuantity}
            />
            <PrimaryButton onClick={purchasePack} large>
              <Trans>Buy - {(price / 100).toFixed(2)}€</Trans>
            </PrimaryButton>
          </Column>
        ) : (
          <Placeholder>
            {released ? (availableQuantity ? t`Sold out` : t`Already bought`) : t`On sale ${releaseDateFormatted}`}
          </Placeholder>
        )}
      </Column>
      <PackPurchaseModal
        stripeClientSecret={stripeClientSecret}
        paymentIntentError={paymentIntentError}
        price={price}
        quantity={quantity}
      />
    </>
  )
}
