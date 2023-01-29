import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import { useActiveLocale } from '@/hooks/useActiveLocale'
import Link from '@/components/Link'
import { TYPE } from '@/styles/theme'
import { ColumnCenter } from '@/components/Column'
import { LargeSpinner } from '@/components/Spinner'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import CardPendingStatusText from '@/components/CardPendingStatusText'
import { CardPendingStatus } from '@/hooks/useCardsPendingStatus'

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

const Card = styled.img<{ inDelivery: boolean; pendingStatus: boolean }>`
  width: 100%;
  border-radius: 4.44%/3.17%;
  ${({ inDelivery, pendingStatus }) => (inDelivery || pendingStatus) && 'opacity: 0.3;'}
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
  innerRef?: (node: any) => void
  slug: string
  cardModelSlug: string
  pictureUrl: string
  width?: number
  serialNumber?: number
  inDelivery?: boolean
  onSale?: boolean
  pendingStatus?: CardPendingStatus
  season?: number
  artistName?: string
  lowestAsk?: string
  onClick?: () => void
}

const MemoizedCardModelPropsEqualityCheck = (prevProps: CardModelProps, nextProps: CardModelProps) =>
  prevProps.slug === nextProps.slug && !!prevProps.innerRef === !!nextProps.innerRef

const MemoizedCardModel = React.memo(function OfferCards({
  innerRef,
  cardModelSlug,
  pictureUrl,
  width,
  serialNumber,
  onSale = false,
  pendingStatus,
  inDelivery = false,
  season,
  artistName,
  lowestAsk,
  onClick,
}: CardModelProps) {
  // locale
  const locale = useActiveLocale()

  // lowest ask / average sale
  const parsedLowestAsk = useMemo(() => (lowestAsk ? WeiAmount.fromRawAmount(lowestAsk) : null), [lowestAsk])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // link
  const cardLink = useMemo(
    () => (onClick ? undefined : `/card/${cardModelSlug}${!!serialNumber ? `/${serialNumber}` : ''}`),
    [!!onClick]
  )

  return (
    <StyledCardModel width={width} ref={innerRef}>
      <StyledCustomCardModel onClick={onClick} href={cardLink}>
        <Card src={pictureUrl} inDelivery={inDelivery} pendingStatus={!!pendingStatus} />
        {inDelivery && <InDelivery src={`/assets/delivery.${locale}.png`} />}
        {onSale && !pendingStatus && <OnSale src={`/assets/onsale.${locale}.png`} />}
        {pendingStatus && <StyledLargeSpinner className="spinner" />}
      </StyledCustomCardModel>

      {pendingStatus && (
        <ColumnCenter gap={4}>
          <TYPE.body textAlign="center">
            <CardPendingStatusText pendingStatus={pendingStatus} />
          </TYPE.body>
          <TYPE.subtitle textAlign="center">
            <Trans>Please come back later.</Trans>
          </TYPE.subtitle>
        </ColumnCenter>
      )}

      {season && artistName && !pendingStatus && (
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
},
MemoizedCardModelPropsEqualityCheck)

export default MemoizedCardModel
