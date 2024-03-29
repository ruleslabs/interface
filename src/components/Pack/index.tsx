import 'moment/locale/fr'

import { Trans } from '@lingui/macro'
import moment from 'moment'
import { useMemo } from 'react'
import { ColumnCenter } from 'src/components/Column'
import { useActiveLocale } from 'src/hooks/useActiveLocale'
import { TYPE } from 'src/styles/theme'
import Image from 'src/theme/components/Image'
import styled, { css } from 'styled-components/macro'

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
`

const StatusStyle = css`
  position: absolute;
  left: 6.25%;
  width: 87.5%;
  mix-blend-mode: hard-light;
  filter: contrast(1.3) brightness(1.3) drop-shadow(2px 4px 6px ${({ theme }) => theme.black});
`

const InDelivery = styled.img`
  ${StatusStyle}
  top: 39.6%;
`

const Soldout = styled.img`
  ${StatusStyle}
  top: 39.6%;
`

const PackInfos = styled(ColumnCenter)`
  gap: 4px;

  ${({ theme }) => theme.media.computer`
    visibility: hidden;
  `}
`

const StyledPack = styled(ColumnCenter)<{ width?: number; disabled: boolean }>`
  gap: 12px;
  ${({ width }) => width && `width: ${width}px;`}
  padding: 8px;
  border-radius: 6px;
  transition: background 200ms, transform 200ms ease-out;

  ${({ disabled }) =>
    disabled &&
    `
      img:first-child {
        opacity: 0.5;
      }

      &:hover img:first-child {
        opacity: 0.7;
      }
    `}

  &:hover ${PackInfos} {
    visibility: visible;
  }

  ${({ theme }) => theme.media.computer`
    &:hover {
      background: ${theme.bg3}80;
      transform: translateY(-8px) scale(1.02);
    }
  `}
`

type PackState = 'opened' | 'inDelivery' | 'delivered' | 'buyable'

interface PackProps {
  slug: string
  name?: string
  releaseDate?: Date
  pictureUrl: string
  soldout?: boolean
  width?: number
  state?: PackState
  isOwner?: boolean
}

export default function Pack({
  name,
  releaseDate,
  pictureUrl,
  soldout = false,
  width,
  state = 'delivered',
}: PackProps) {
  const locale = useActiveLocale()

  const releaseDateFormatted = useMemo(() => {
    if (!releaseDate) return

    const releaseMoment = moment(releaseDate)
    releaseMoment.locale(locale)

    const lowerCasedDate = releaseMoment.format('MMMM YYYY')
    return lowerCasedDate.charAt(0).toUpperCase() + lowerCasedDate.slice(1)
  }, [releaseDate, locale])

  const disabled = useMemo(() => state === 'inDelivery' || state === 'opened', [state])

  return (
    <StyledPack width={width} disabled={disabled}>
      <ImageWrapper>
        <Image src={pictureUrl} width="full" />
        {state === 'inDelivery' && <InDelivery src={`/assets/inDelivery.${locale}.png`} />}
        {soldout && <Soldout src="/assets/soldout.png" />}
      </ImageWrapper>

      {name && (
        <PackInfos>
          <TYPE.body textAlign="center" fontWeight={500}>
            {name}
          </TYPE.body>

          {releaseDateFormatted && (
            <TYPE.subtitle textAlign="center">
              <Trans>Edited in {releaseDateFormatted}</Trans>
            </TYPE.subtitle>
          )}
        </PackInfos>
      )}
    </StyledPack>
  )
}
