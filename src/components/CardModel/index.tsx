import React, { useMemo, useCallback, useRef } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import { useActiveLocale } from '@/hooks/useActiveLocale'
import Link, { LinkProps } from '@/components/Link'
import { TYPE } from '@/styles/theme'
import { ColumnCenter } from '@/components/Column'
import { LargeSpinner } from '@/components/Spinner'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import CardPendingStatusText from '@/components/CardPendingStatusText'
import { CardPendingStatus } from '@/hooks/useCardsPendingStatus'

const StyledCardModel = styled(ColumnCenter)<{ width?: number }>`
  position: relative;
  gap: 12px;
  ${({ width }) => width && `width: ${width}px;`}
  padding: 8px;
  border-radius: 4px;
  transition: background 200ms, transform 200ms ease-out;

  :hover {
    background: ${({ theme }) => theme.bg3}80;
    transform: translateY(-8px) scale(1.02);
  }
`

const Video = styled.video<{ inDelivery: boolean; pendingStatus: boolean }>`
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

type CustomCardModelProps = LinkProps | React.HTMLAttributes<HTMLDivElement>

const CustomCardModel = (props: CustomCardModelProps) =>
  (props as LinkProps).href ? (
    <Link {...(props as LinkProps)} />
  ) : (
    <div {...(props as React.HTMLAttributes<HTMLDivElement>)} />
  )

interface CardModelProps {
  innerRef?: (node: any) => void
  slug?: string
  cardModelSlug?: string
  videoUrl?: string
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
  prevProps.slug === nextProps.slug &&
  !!prevProps.innerRef === !!nextProps.innerRef &&
  prevProps.cardModelSlug === nextProps.cardModelSlug

const MemoizedCardModel = React.memo(function CardModel({
  innerRef,
  cardModelSlug,
  videoUrl,
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
    () => (cardModelSlug ? `/card/${cardModelSlug}${!!serialNumber ? `/${serialNumber}` : ''}` : undefined),
    [cardModelSlug, serialNumber]
  )

  // card video play pause
  const videoRef = useRef<HTMLVideoElement>(null)

  const playVideo = useCallback(() => {
    videoRef?.current?.play()
  }, [videoRef])

  const pauseVideo = useCallback(() => {
    videoRef?.current?.pause()
  }, [videoRef])

  return (
    <CustomCardModel onClick={onClick} href={cardLink}>
      <StyledCardModel width={width} ref={innerRef} onMouseOver={playVideo} onMouseOut={pauseVideo}>
        <Video
          src={videoUrl}
          inDelivery={inDelivery}
          pendingStatus={!!pendingStatus}
          ref={videoRef}
          poster={pictureUrl}
          preload="none"
          loop
          playsInline
          muted
        />
        {inDelivery && <InDelivery src={`/assets/delivery.${locale}.png`} />}
        {onSale && !pendingStatus && <OnSale src={`/assets/onsale.${locale}.png`} />}
        {pendingStatus && <StyledLargeSpinner className="spinner" />}

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
            <TYPE.body spanColor="text2" fontWeight={500}>
              {+parsedLowestAsk.toFixed(6)} ETH&nbsp;
              <span>{weiAmountToEURValue(parsedLowestAsk ?? undefined) ?? '0'}€</span>
            </TYPE.body>
          </ColumnCenter>
        )}
      </StyledCardModel>
    </CustomCardModel>
  )
},
MemoizedCardModelPropsEqualityCheck)

export default MemoizedCardModel
