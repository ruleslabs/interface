import { Trans, Plural } from '@lingui/macro'

import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import Link from 'src/components/Link'
import Placeholder from 'src/components/Placeholder'
import CardModelPriceStats from './CardModelPriceStats'
import * as Text from 'src/theme/components/Text'

interface CardModelSalesProps {
  slug: string
  cardModelId?: string
  lowestAsk?: string
  averageSale?: string
  listingsCount: number
}

export default function CardModelSales({ slug, listingsCount, lowestAsk, averageSale }: CardModelSalesProps) {
  return (
    <Column gap={36}>
      <CardModelPriceStats lowestAsk={lowestAsk} averageSale={averageSale} />

      {listingsCount ? (
        <Column gap={12}>
          <Link href={`/card/${slug}/offers`}>
            <PrimaryButton style={{ width: '100%' }} large>
              <Trans>Select and buy</Trans>
            </PrimaryButton>
          </Link>

          <Text.Body textAlign={'center'} width={'full'}>
            <Plural value={listingsCount} _1="one card on sale" other="{listingsCount} cards on sale" />
          </Text.Body>
        </Column>
      ) : (
        <Placeholder>
          <Trans>No cards on sale.</Trans>
        </Placeholder>
      )}
    </Column>
  )
}
