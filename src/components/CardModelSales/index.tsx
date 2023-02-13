import styled from 'styled-components'
import { Trans, Plural } from '@lingui/macro'

import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Link from '@/components/Link'
import Placeholder from '@/components/Placeholder'
import { useSearchOffers } from '@/state/search/hooks'
import CardModelPriceStats from './CardModelPriceStats'

const CardsOnSaleCount = styled(TYPE.body)`
  text-align: center;
  width: 100%;
`

interface CardModelSalesProps {
  slug: string
  cardModelId?: string
  lowestAsk?: string
  averageSale?: string
}

export default function CardModelSales({ slug, cardModelId, lowestAsk, averageSale }: CardModelSalesProps) {
  // get cards on sale count
  const offersSearch = useSearchOffers({ facets: { cardModelId }, skip: !cardModelId })

  return (
    <Column gap={36}>
      <CardModelPriceStats lowestAsk={lowestAsk} averageSale={averageSale} />

      {offersSearch?.nbHits ? (
        <Column gap={12}>
          <Link href={`/card/${slug}/buy`}>
            <PrimaryButton style={{ width: '100%' }} large>
              <Trans>Select and buy</Trans>
            </PrimaryButton>
          </Link>

          <CardsOnSaleCount textAlign="center">
            <Plural value={offersSearch.nbHits} _1="{0} card on sale" other="{0} cards on sale" />
          </CardsOnSaleCount>
        </Column>
      ) : (
        <Placeholder>
          <Trans>No cards on sale.</Trans>
        </Placeholder>
      )}
    </Column>
  )
}
