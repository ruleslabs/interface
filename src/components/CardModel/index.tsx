/* eslint-disable react/display-name */
import React, { useMemo, useCallback, useRef } from 'react'
import styled, { css } from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import { useActiveLocale } from 'src/hooks/useActiveLocale'
import Link from 'src/components/Link'
import { TYPE } from 'src/styles/theme'
import Column, { ColumnCenter } from 'src/components/Column'
import { LargeSpinner } from 'src/components/Spinner'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import Badges, { Badge } from './Badges'
import { RowCenter } from '../Row'
import { usePendingOperations } from 'src/hooks/usePendingOperations'
import useTrans from 'src/hooks/useTrans'

const ActiveCardModelStyle = css`
  background: ${({ theme }) => theme.bg3}80;
  transform: translateY(-8px) scale(1.02);
`

const StyledCardModel = styled(ColumnCenter)<{ width?: number; selected: boolean; selectable: boolean }>`
  position: relative;
  gap: 12px;
  ${({ width }) => width && `width: ${width}px;`}
  padding: 8px;
  border-radius: 6px;
  transition: background 200ms, transform 200ms ease-out;

  ${({ theme, selectable, selected }) => theme.media.computer`
    &:hover {
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

const Video = styled.video<{ inDelivery: boolean; hasPendingOperation: boolean }>`
  width: 100%;
  border-radius: 4.7% / 3.35%;
  ${({ inDelivery, hasPendingOperation }) => (inDelivery || hasPendingOperation) && 'opacity: 0.5;'}
`

const PlasticEffect = css`
  mix-blend-mode: hard-light;
  filter: contrast(1.3) brightness(1.3) drop-shadow(2px 4px 6px ${({ theme }) => theme.black});
`

const InDelivery = styled.img`
  ${PlasticEffect}
  position: absolute;
  left: 0;
  width: 100%;
  top: 37.2%;
`

const OnSale = styled.img`
  ${PlasticEffect}
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
  cardModelSlug?: string
  videoUrl?: string
  pictureUrl: string
  width?: number
  serialNumber?: number
  inDelivery?: boolean
  onSale?: boolean
  season?: number
  artistName?: string
  lowestAsk?: string
  onClick?: () => void
  badges?: Badge[]
  selectable?: boolean
  selected?: boolean
  tokenId?: string
  onSelection?: (slug: string) => void
}

const CardModel = React.forwardRef<HTMLDivElement, CardModelProps>(
  (
    {
      cardModelSlug,
      videoUrl,
      pictureUrl,
      width,
      serialNumber,
      onSale = false,
      inDelivery = false,
      season,
      artistName,
      lowestAsk,
      onClick,
      badges,
      selectable = false,
      selected = false,
      tokenId,
    },
    ref
  ) => {
    // trans
    const trans = useTrans()

    // locale
    const locale = useActiveLocale()

    // lowest ask / average sale
    const parsedLowestAsk = useMemo(() => (lowestAsk ? WeiAmount.fromRawAmount(lowestAsk) : null), [lowestAsk])

    // fiat
    const weiAmountToEURValue = useWeiAmountToEURValue()

    // card video play pause
    const videoRef = useRef<HTMLVideoElement>(null)

    const playVideo = useCallback(() => videoRef?.current?.play(), [videoRef])
    const pauseVideo = useCallback(() => videoRef?.current?.pause(), [videoRef])

    // pending operations
    const pendingOperations = usePendingOperations(tokenId)
    const pendingOperation = pendingOperations[0]
    selectable = selectable && !pendingOperation // disable selectable if there's a pending operation

    // link
    const cardLink = useMemo(
      () =>
        cardModelSlug && !selectable
          ? `/card/${cardModelSlug}${!!serialNumber ? `/${serialNumber}` : ''}`
          : 'javascript: void(0)',
      [cardModelSlug, serialNumber, selectable]
    )

    return (
      <Link onClick={onClick} href={cardLink}>
        <StyledCardModel
          width={width}
          ref={ref}
          onMouseOver={playVideo}
          onMouseOut={pauseVideo}
          selected={selected}
          selectable={selectable}
        >
          <VideoWrapper>
            <Video
              src={videoUrl}
              inDelivery={inDelivery}
              hasPendingOperation={!!pendingOperation}
              ref={videoRef}
              poster={pictureUrl}
              preload="none"
              loop
              playsInline
              muted
            />

            {inDelivery && <InDelivery src={`/assets/delivery.${locale}.png`} />}
            {onSale && !pendingOperation && <OnSale src={`/assets/onsale.${locale}.png`} />}
            {!!pendingOperation && <StyledLargeSpinner className="spinner" />}
          </VideoWrapper>

          {!!pendingOperation && (
            <ColumnCenter gap={4}>
              <TYPE.body textAlign="center">{trans('operation', pendingOperation.type)}</TYPE.body>
              <TYPE.subtitle textAlign="center">
                <Trans>Please come back later.</Trans>
              </TYPE.subtitle>
            </ColumnCenter>
          )}

          {season && artistName && !pendingOperation && (
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

              <RowCenter gap={4}>
                <TYPE.medium fontSize={16}>{+parsedLowestAsk.toFixed(6)} ETH</TYPE.medium>
                <TYPE.subtitle>{weiAmountToEURValue(parsedLowestAsk ?? undefined) ?? '0'}€</TYPE.subtitle>
              </RowCenter>
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
  }
)

export default CardModel
