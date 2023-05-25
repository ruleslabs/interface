import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { t, Trans } from '@lingui/macro'
import { WeiAmount, Fraction } from '@rulesorg/sdk-core'

import Column from 'src/components/Column'
import Row from 'src/components/Row'
import { InfoTooltip } from 'src/components/Tooltip'
import { TYPE } from 'src/styles/theme'
import { ARTIST_FEE_PERCENTAGE, MARKETPLACE_FEE_PERCENTAGE } from 'src/constants/misc'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import Divider from 'src/components/Divider'

const PriceBreakdownLine = styled(Row)`
  width: 100%;
  gap: 8px;

  & > div:last-child {
    margin-left: auto;
  }
`

interface SaleBreakdownProps {
  price: string
  artistName?: string
}

export function SaleBreakdown({ price, artistName }: SaleBreakdownProps) {
  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // price breakdown
  const { artistFee, marketplaceFee, payout } = useMemo(() => {
    const parsedPrice = WeiAmount.fromRawAmount(price)

    return {
      artistFee: parsedPrice?.multiply(new Fraction(ARTIST_FEE_PERCENTAGE, 1_000_000)),
      marketplaceFee: parsedPrice?.multiply(new Fraction(MARKETPLACE_FEE_PERCENTAGE, 1_000_000)),
      payout: parsedPrice?.multiply(
        new Fraction(1_000_000 - MARKETPLACE_FEE_PERCENTAGE - ARTIST_FEE_PERCENTAGE, 1_000_000)
      ),
    }
  }, [price])

  return (
    <Column gap={24}>
      <Column gap={12}>
        <PriceBreakdownLine>
          <TYPE.body>
            <Trans>Artist fee ({ARTIST_FEE_PERCENTAGE / 10_000}%)</Trans>
          </TYPE.body>

          <InfoTooltip
            text={
              artistName
                ? t`This fee will go to ${artistName} and his team.`
                : t`This fee will go to artists and their team.`
            }
          />

          <Row gap={8}>
            <TYPE.subtitle>{weiAmountToEURValue(artistFee) ?? 0}€</TYPE.subtitle>
            <TYPE.body>{artistFee?.toSignificant(6) ?? 0} ETH</TYPE.body>
          </Row>
        </PriceBreakdownLine>

        <PriceBreakdownLine>
          <TYPE.body>
            <Trans>Marketplace fee ({MARKETPLACE_FEE_PERCENTAGE / 10_000}%)</Trans>
          </TYPE.body>

          <InfoTooltip text={t`This fee will help Rules' further development.`} />

          <Row gap={8}>
            <TYPE.subtitle>{weiAmountToEURValue(marketplaceFee) ?? 0}€</TYPE.subtitle>
            <TYPE.body>{marketplaceFee?.toSignificant(6) ?? 0} ETH</TYPE.body>
          </Row>
        </PriceBreakdownLine>
      </Column>

      <Divider />

      <PriceBreakdownLine>
        <TYPE.body>
          <Trans>Total payout</Trans>
        </TYPE.body>

        <Row gap={8}>
          <TYPE.subtitle>{weiAmountToEURValue(payout) ?? 0}€</TYPE.subtitle>
          <TYPE.body>{payout?.toSignificant(6) ?? 0} ETH</TYPE.body>
        </Row>
      </PriceBreakdownLine>
    </Column>
  )
}

interface PurchaseBreakdownProps extends React.HTMLAttributes<HTMLDivElement> {
  price: string
}

export function PurchaseBreakdown({ price, children, ...props }: PurchaseBreakdownProps) {
  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // price
  const parsedPrice = useMemo(() => WeiAmount.fromRawAmount(price), [price])

  return (
    <Column gap={12} {...props}>
      <PriceBreakdownLine>
        <TYPE.medium>{children || <Trans>You Pay</Trans>}</TYPE.medium>

        <Row gap={8}>
          <TYPE.medium color="text2">{weiAmountToEURValue(parsedPrice) ?? 0}€</TYPE.medium>
          <TYPE.medium>{parsedPrice?.toSignificant(6) ?? 0} ETH</TYPE.medium>
        </Row>
      </PriceBreakdownLine>
    </Column>
  )
}
