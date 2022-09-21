import { useMemo } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import { useActiveLocale } from '@/hooks/useActiveLocale'
import Link from '@/components/Link'
import { TYPE } from '@/styles/theme'
import { ColumnCenter } from '@/components/Column'
import { LargeSpinner } from '@/components/Spinner'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'

const StyledCardModel = styled(ColumnCenter)<{ width?: number }>`
  position: relative;
  gap: 16px;
  ${({ width }) => width && `width: ${width}px;`}
`

const StyledCustomCardModel = styled(Link)`
  cursor: pointer;
  transform: perspective(0);

  & img {
    transition: transform 100ms;
  }

  &:hover img:not(.spinner) {
    transform: perspective(400px) rotateY(10deg);
  }
`

const Card = styled.img<{ inDelivery: boolean; inTransfer: boolean }>`
  width: 100%;
  ${({ inDelivery, inTransfer }) => (inDelivery || inTransfer) && 'opacity: 0.3;'}
`

const InDelivery = styled.img`
  position: absolute;
  left: 0;
  width: 100%;
  top: 37.2%;
`

const OnSale = styled.img`
  position: absolute;
  top: 22.2%;
  right: 0;
  width: 80%;
`

const StyledLargeSpinner = styled(LargeSpinner)`
  position: absolute;
  width: 20%;
  height: auto;
  left: 40%;
  top: 41.5%;
`

interface CardModelProps {
  cardModelSlug: string
  pictureUrl: string
  width?: number
  serialNumber?: number
  inDelivery?: boolean
  onSale?: boolean
  inTransfer?: boolean
  season?: number
  artistName?: string
  lowestAsk?: string
}

export default function CardModel({
  cardModelSlug,
  pictureUrl,
  width,
  serialNumber,
  onSale = false,
  inTransfer = false,
  inDelivery = false,
  season,
  artistName,
  lowestAsk,
}: CardModelProps) {
  // locale
  const locale = useActiveLocale()

  // lowest ask / average sale
  const parsedLowestAsk = useMemo(() => (lowestAsk ? WeiAmount.fromRawAmount(lowestAsk) : null), [lowestAsk])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  return (
    <StyledCardModel width={width}>
      <StyledCustomCardModel href={`/card/${cardModelSlug}${!!serialNumber ? `/${serialNumber}` : ''}`}>
        <Card src={pictureUrl} inDelivery={inDelivery} inTransfer={inTransfer} />
        {inDelivery && <InDelivery src={`/assets/delivery.${locale}.png`} />}
        {onSale && <OnSale src={`/assets/onsale.${locale}.png`} />}
        {inTransfer && <StyledLargeSpinner className="spinner" />}
      </StyledCustomCardModel>

      {inTransfer && (
        <ColumnCenter gap={4}>
          <TYPE.body textAlign="center">
            <Trans>Transfering the card...</Trans>
          </TYPE.body>
          <TYPE.subtitle textAlign="center">
            <Trans>Please come back later.</Trans>
          </TYPE.subtitle>
        </ColumnCenter>
      )}

      {season && artistName && !inTransfer && (
        <ColumnCenter gap={4}>
          <TYPE.body textAlign="center">
            {artistName} {serialNumber && `#${serialNumber}`}
          </TYPE.body>
          <TYPE.subtitle textAlign="center">
            <Trans>Season {season}</Trans>
          </TYPE.subtitle>
        </ColumnCenter>
      )}

      {parsedLowestAsk && (
        <ColumnCenter gap={4}>
          <TYPE.body textAlign="center">
            <Trans>starting from</Trans>
          </TYPE.body>
          <TYPE.body spanColor="text2">
            {+parsedLowestAsk.toFixed(6)} ETH&nbsp;
            <span>{weiAmountToEURValue(parsedLowestAsk ?? undefined) ?? '0'}€</span>
          </TYPE.body>
        </ColumnCenter>
      )}
    </StyledCardModel>
  )
}
