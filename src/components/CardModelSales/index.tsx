import styled from 'styled-components/macro'
import { Trans, Plural } from '@lingui/macro'

import Column from 'src/components/Column'
import { TYPE } from 'src/styles/theme'
import { PrimaryButton } from 'src/components/Button'
import Link from 'src/components/Link'
import Placeholder from 'src/components/Placeholder'
import { useSearchOffers } from 'src/state/search/hooks'
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
  const offersSearch = useSearchOffers({ facets: { cardModelId }, skip: !cardModelId, hitsPerPage: 1 })

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
