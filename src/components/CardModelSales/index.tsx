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
          <TYPE.body>prix minimum</TYPE.body>
        </TYPE.body>
        <TYPE.body fontWeight={700} fontSize={26}>
          {averageSellEUR ?? '- '}€
          <br />
          <TYPE.body>vente moyenne</TYPE.body>
        </TYPE.body>
      </RowCenter>
      <Column gap={8}>
        <TYPE.body textAlign="center">
          {`${cardsOnSaleCount} carte${cardsOnSaleCount > 1 ? 's' : ''} à vendre`}
        </TYPE.body>
        <Link href={`/card/${slug}/buy`}>
          <PrimaryButton style={{ width: '100%' }} large>
            Selectionner et acheter
          </PrimaryButton>
        </Link>
      </Column>
    </Column>
  )
}
