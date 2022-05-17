import { Trans, Plural } from '@lingui/macro'

import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Link from '@/components/Link'

interface CardModelSalesProps {
  slug: string
  lowestAskEUR?: string
  averageSellEUR?: string
  cardsOnSaleCount: number
}

export default function CardModelSales({ slug, lowestAskEUR, averageSellEUR, cardsOnSaleCount }: CardModelSalesProps) {
  return (
    <Column gap={50}>
      <RowCenter gap={12} justify="space-between">
        <TYPE.body fontWeight={700} fontSize={26}>
          {lowestAskEUR ?? '- '}€
          <br />
          <TYPE.body>
            <Trans>Lowest ask</Trans>
          </TYPE.body>
        </TYPE.body>
        <TYPE.body fontWeight={700} fontSize={26}>
          {averageSellEUR ?? '- '}€
          <br />
          <TYPE.body>
            <Trans>Average sale</Trans>
          </TYPE.body>
        </TYPE.body>
      </RowCenter>
      <Column gap={8}>
        <TYPE.body textAlign="center">
          <Plural
            value={cardsOnSaleCount}
            _1="{cardsOnSaleCount} card on sale"
            other="{cardsOnSaleCount} cards on sale"
          />
        </TYPE.body>
        <Link href={`/card/${slug}/buy`}>
          <PrimaryButton style={{ width: '100%' }} large>
            <Trans>Select and buy</Trans>
          </PrimaryButton>
        </Link>
      </Column>
    </Column>
  )
}
