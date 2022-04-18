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

interface PackBreakdownProps {
  name: string
  id: string
  seasons: number[]
  cardsPerPack: number
  price: number
  releaseDate?: Date
  availableSupply?: number
}

export default function PackBreakdown({
  name,
  id,
  seasons,
  cardsPerPack,
  price,
  releaseDate,
  availableSupply,
}: PackBreakdownProps) {
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
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

    createPaymentIntent(id)
      .catch((err) => console.error(err))
      .then((data) => setStripeClientSecret(data?.clientSecret ?? null))
  }, [id])

  return (
    <Card width="350px">
      <Column gap={32}>
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
        {released && (!availableSupply || availableSupply > 0) ? (
          <PrimaryButton onClick={purchasePack} large>
            Acheter - {(price / 100).toFixed(2)}€
          </PrimaryButton>
        ) : (
          <Placeholder>{released ? 'En rupture de stock' : `En vente ${releaseDateFormatted}`}</Placeholder>
        )}
      </Column>
      <PackPurchaseModal stripeClientSecret={stripeClientSecret} amount={price} />
    </Card>
  )
}
