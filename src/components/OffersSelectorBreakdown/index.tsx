import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Row from '@/components/Row'
import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'

const CardModelImage = styled.img`
  width: 84px;
`

interface OffersSelectorBreakdownProps {
  artistName: string
  season: number
  scarcity: string
  pictureUrl: string
  parsedPrice?: number
}

export default function OffersSelectorBreakdown({
  artistName,
  season,
  scarcity,
  pictureUrl,
  parsedPrice,
}: CardSelectorBreakdownProps) {
  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  return (
    <Column gap={32}>
      <Row gap={12}>
        <CardModelImage src={pictureUrl} />
        <Column gap={8}>
          <TYPE.body fontWeight={700}>{artistName}</TYPE.body>
          <TYPE.body>
            <Trans>Season {season}</Trans>
          </TYPE.body>
          <Trans id={scarcity} render={({ translation }) => <TYPE.body>{translation}</TYPE.body>} />
        </Column>
      </Row>
      <PrimaryButton large disabled={!parsedPrice}>
        {parsedPrice
          ? t`Buy - ${parsedPrice.toSignificant(6)} ETH (${weiAmountToEURValue(parsedPrice) ?? 0}€)`
          : t`Select a card`}
      </PrimaryButton>
    </Column>
  )
}
