import React, { useMemo, useState, useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import Row from '@/components/Row'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import { SecondaryButton } from '@/components/Button'

import EthereumPlainIcon from '@/images/ethereum-plain.svg'

const CurrencySwitch = styled(SecondaryButton)`
  min-width: 26px;
  height: 52px;
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 6px;
  background: transparent;
  padding: 0;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: auto;

  & > svg {
    width: 14px;
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

interface CardModelPriceStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  lowestAsk?: string
  averageSale?: string
}

export default function CardModelPriceStats({ lowestAsk, averageSale, ...props }: CardModelPriceStatsProps) {
  // lowest ask / average sale
  const parsedLowestAsk = useMemo(() => (lowestAsk ? WeiAmount.fromRawAmount(lowestAsk) : null), [lowestAsk])
  const parsedAverageSale = useMemo(() => (averageSale ? WeiAmount.fromRawAmount(averageSale) : null), [averageSale])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  const [fiatMode, setFiatMode] = useState(false)
  const toggleFiatMode = useCallback(() => setFiatMode(!fiatMode), [fiatMode])

  return (
    <Row alignItems="flex-start" gap={16} {...props}>
      <PriceInfo>
        <TYPE.body>
          <Trans>Lowest ask</Trans>
        </TYPE.body>
        <TYPE.large fontSize={fiatMode ? 26 : 22}>
          {fiatMode
            ? `${weiAmountToEURValue(parsedLowestAsk ?? undefined) ?? '0'}€`
            : `${+(parsedLowestAsk?.toFixed(6) ?? 0)}Ξ`}
        </TYPE.large>
      </PriceInfo>

      <PriceInfo>
        <TYPE.body>
          <Trans>Average sale</Trans>
        </TYPE.body>
        <TYPE.large fontSize={fiatMode ? 26 : 22}>
          {fiatMode
            ? `${weiAmountToEURValue(parsedAverageSale ?? undefined) ?? '0'}€`
            : `${+(parsedAverageSale?.toFixed(6) ?? 0)}Ξ`}
        </TYPE.large>
      </PriceInfo>

      <CurrencySwitch onClick={toggleFiatMode}>{fiatMode ? <EthereumPlainIcon /> : '€'}</CurrencySwitch>
    </Row>
  )
}
