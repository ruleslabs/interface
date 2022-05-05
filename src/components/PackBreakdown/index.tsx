import 'moment/locale/fr'

import { useMemo, useCallback, useState } from 'react'
import moment from 'moment'

import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Card from '@/components/Card'
import Placeholder from '@/components/Placeholder'
import { useCreatePaymentIntent } from '@/state/stripe/hooks'
import PackPurchaseModal from '@/components/PackPurchaseModal'
import { usePackPurchaseModalToggle } from '@/state/application/hooks'
import InputStepCounter from '@/components/Input/StepCounter'

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

  const released = releaseDate ? +releaseDate - +new Date() <= 0 : true

  const releaseDateFormatted = useMemo(() => {
    if (released) return null

    const releaseMoment = moment(releaseDate)
    releaseMoment.locale('fr')

    return releaseMoment.format('dddd D MMMM [à] h[h]')
  }, [released, releaseDate])

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
    <Card width="350px">
      <Column gap={28}>
        <Column gap={8}>
          <TYPE.body fontWeight={700} fontSize={28}>
            {name}
          </TYPE.body>
          <TYPE.body>
            Season{seasons.length > 1 ? 's ' : ' '}
            {seasons.map((season, index) => `${index > 0 ? ', ' : ''}${season}`)}
          </TYPE.body>
          <TYPE.body>
            Contient {cardsPerPack} carte{cardsPerPack > 1 ? 's' : ''}
          </TYPE.body>
        </Column>
        {released && (!availableSupply || availableSupply > 0) && availableQuantity ? (
          <Column gap={12}>
            <InputStepCounter
              value={quantity}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              min={1}
              max={availableQuantity}
            />
            <PrimaryButton onClick={purchasePack} large>
              Acheter - {(price / 100).toFixed(2)}€
            </PrimaryButton>
          </Column>
        ) : (
          <Placeholder>
            {released
              ? availableQuantity
                ? 'En rupture de stock'
                : 'Déjà acheté'
              : `En vente ${releaseDateFormatted}`}
          </Placeholder>
        )}
      </Column>
      <PackPurchaseModal
        stripeClientSecret={stripeClientSecret}
        paymentIntentError={paymentIntentError}
        price={price}
        quantity={quantity}
      />
    </Card>
  )
}
