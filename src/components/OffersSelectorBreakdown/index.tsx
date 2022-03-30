import styled from 'styled-components'

import { TYPE } from '@/styles/theme'
import Row from '@/components/Row'
import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'
import Card from '@/components/Card'

const CardModelImage = styled.img`
  width: 84px;
`

interface CardSelectorBreakdownProps {
  artistName: string
  season: number
  scarcity: string
  pictureUrl: string
  price?: number
}

export default function CardSelectorBreakdown({
  artistName,
  season,
  scarcity,
  pictureUrl,
  price,
}: CardSelectorBreakdownProps) {
  return (
    <Card width="350px">
      <Column gap={32}>
        <Row gap={12}>
          <CardModelImage src={pictureUrl} />
          <Column gap={8}>
            <TYPE.body fontWeight={700}>{artistName}</TYPE.body>
            <TYPE.body>Season {season}</TYPE.body>
            <TYPE.body>{scarcity}</TYPE.body>
          </Column>
        </Row>
        <PrimaryButton large disabled={!price}>
          {price ? `Acheter - ${price}€` : 'Selectionnez un exemplaire'}
        </PrimaryButton>
      </Column>
    </Card>
  )
}
