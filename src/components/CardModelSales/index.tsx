import { useMemo, useState, useCallback } from 'react'
import styled from 'styled-components'
import { Trans, Plural } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import Row from '@/components/Row'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Link from '@/components/Link'
import Placeholder from '@/components/Placeholder'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import { SecondaryButton } from '@/components/Button'

import EthereumPlainIcon from '@/images/ethereum-plain.svg'

const CurrencySwitch = styled(SecondaryButton)`
  min-width: 26px;
  height: 48px;
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 3px;
  background: transparent;
  padding: 0;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;

  & > svg {
    width: 16px;
    fill: ${({ theme }) => theme.text1};
  }

  &:hover {
    background: ${({ theme }) => theme.bg3};
  }
`

const PriceInfo = styled(Column)`
  gap: 2px;

  & > div:first-child {
    white-space: nowrap;
  }
`

const CardsOnSaleCount = styled(TYPE.body)`
  text-align: center;
  width: 100%;
`

interface CardModelSalesProps {
  slug: string
  lowestAsk?: string
  averageSale?: string
  cardsOnSaleCount: number
}

export default function CardModelSales({ slug, lowestAsk, averageSale, cardsOnSaleCount }: CardModelSalesProps) {
  // lowest ask / average sale
  const parsedLowestAsk = useMemo(() => (lowestAsk ? WeiAmount.fromRawAmount(lowestAsk) : null), [lowestAsk])
  const parsedAverageSale = useMemo(() => (averageSale ? WeiAmount.fromRawAmount(averageSale) : null), [averageSale])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  const [fiatMode, setFiatMode] = useState(false)
  const toggleFiatMode = useCallback(() => setFiatMode(!fiatMode), [fiatMode])

  return (
    <Column gap={36}>
      <Row alignItems="flex-start" gap={12} justify="space-between">
        <PriceInfo>
          <TYPE.body>
            <Trans>Lowest ask</Trans>
          </TYPE.body>
          <TYPE.large fontSize={fiatMode ? 26 : 22}>
            {fiatMode
              ? `${weiAmountToEURValue(parsedLowestAsk) ?? '0'}€`
              : `${parsedLowestAsk?.toSignificant(6) ?? '0'}Ξ`}
          </TYPE.large>
        </PriceInfo>

        <PriceInfo>
          <TYPE.body>
            <Trans>Average sale</Trans>
          </TYPE.body>
          <TYPE.large fontSize={fiatMode ? 26 : 22}>
            {fiatMode
              ? `${weiAmountToEURValue(parsedAverageSale) ?? '0'}€`
              : `${parsedAverageSale?.toSignificant(6) ?? '0'}Ξ`}
          </TYPE.large>
        </PriceInfo>

        <CurrencySwitch onClick={toggleFiatMode}>{fiatMode ? '€' : <EthereumPlainIcon />}</CurrencySwitch>
      </Row>

      {cardsOnSaleCount === 0 ? (
        <Placeholder>
          <Trans>No cards on sale.</Trans>
        </Placeholder>
      ) : (
        <Column gap={12}>
          <Link href={`/card/${slug}/buy`}>
            <PrimaryButton style={{ width: '100%' }} large>
              <Trans>Select and buy</Trans>
            </PrimaryButton>
          </Link>

          <CardsOnSaleCount textAlign="center">
            <Plural
              value={cardsOnSaleCount}
              _1="{cardsOnSaleCount} card on sale"
              other="{cardsOnSaleCount} cards on sale"
            />
          </CardsOnSaleCount>
        </Column>
      )}
    </Column>
  )
}
