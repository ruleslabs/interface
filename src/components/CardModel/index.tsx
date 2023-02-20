import React, { useMemo, useCallback, useRef } from 'react'
import styled, { css } from 'styled-components'
import { Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import { useActiveLocale } from '@/hooks/useActiveLocale'
import Link from '@/components/Link'
import { TYPE } from '@/styles/theme'
import Column, { ColumnCenter } from '@/components/Column'
import { LargeSpinner } from '@/components/Spinner'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import CardPendingStatusText from '@/components/CardPendingStatusText'
import { CardPendingStatus } from '@/hooks/useCardsPendingStatusMap'
import Badges, { Badge } from './Badges'

const ActiveCardModelStyle = css`
  background: ${({ theme }) => theme.bg3}80;
  transform: translateY(-8px) scale(1.02);
`

const StyledCardModel = styled(ColumnCenter)<{ width?: number; selected: boolean; selectable: boolean }>`
  position: relative;
  gap: 12px;
  ${({ width }) => width && `width: ${width}px;`}
  padding: 8px;
  border-radius: 4px;
  transition: background 200ms, transform 200ms ease-out;

  ${({ theme, selectable, selected }) => theme.media.computer`
    :hover {
      ${ActiveCardModelStyle}
      ${selectable && !selected && 'opacity: 0.7;'}
    }
  `}

  ${({ selectable, selected }) => selectable && selected && ActiveCardModelStyle}

  ${({ selectable, selected }) =>
    selectable &&
    !selected &&
    `
      opacity: 0.3;
    `}
`

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
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

const BadgesWrapper = styled(Column)`
  gap: 16px;
  position: absolute;
  top: -10px;
  right: -10px;

  & > svg {
    border-radius: 50%;
    width: 36px;
    height: 36px;
    box-shadow: 0px 4px 4px #00000040;
  }
`

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
  badges?: Badge[]
  selectable?: boolean
  selected?: boolean
  onSelection?: (slug: string) => void
}

const MemoizedCardModelPropsEqualityCheck = (prevProps: CardModelProps, nextProps: CardModelProps) =>
  prevProps.slug === nextProps.slug &&
  !!prevProps.innerRef === !!nextProps.innerRef &&
  prevProps.cardModelSlug === nextProps.cardModelSlug &&
  prevProps.lowestAsk === nextProps.lowestAsk &&
  prevProps.selectable === nextProps.selectable &&
  prevProps.selected === nextProps.selected &&
  prevProps.onClick === nextProps.onClick &&
  prevProps.badges?.length === nextProps.badges?.length

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
  badges,
  selectable = false,
  selected = false,
}: CardModelProps) {
  // locale
  const locale = useActiveLocale()

  // lowest ask / average sale
  const parsedLowestAsk = useMemo(() => (lowestAsk ? WeiAmount.fromRawAmount(lowestAsk) : null), [lowestAsk])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // link
  const cardLink = useMemo(
    () =>
      cardModelSlug && !selectable
        ? `/card/${cardModelSlug}${!!serialNumber ? `/${serialNumber}` : ''}`
        : 'javascript: void(0)',
    [cardModelSlug, serialNumber, selectable]
  )

  // card video play pause
  const videoRef = useRef<HTMLVideoElement>(null)

  const playVideo = useCallback(() => videoRef?.current?.play(), [videoRef])
  const pauseVideo = useCallback(() => videoRef?.current?.pause(), [videoRef])

  // selection

  return (
    <Link onClick={onClick} href={cardLink}>
      <StyledCardModel
        width={width}
        ref={innerRef}
        onMouseOver={playVideo}
        onMouseOut={pauseVideo}
        selected={selected}
        selectable={selectable}
      >
        <VideoWrapper>
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
        </VideoWrapper>

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

        {badges && (
          <BadgesWrapper>
            <Badges badges={badges} />
          </BadgesWrapper>
        )}
      </StyledCardModel>
    </Link>
  )
},
MemoizedCardModelPropsEqualityCheck)

export default MemoizedCardModel
