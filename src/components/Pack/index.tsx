import 'moment/locale/fr'

import { useMemo } from 'react'
import moment from 'moment'
import styled, { css } from 'styled-components'
import { Trans } from '@lingui/macro'

import Link from '@/components/Link'
import { useActiveLocale } from '@/hooks/useActiveLocale'
import { TYPE } from '@/styles/theme'
import { ColumnCenter } from '@/components/Column'

const Image = styled.img`
  width: 100%;
`

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
`

const StatusStyle = css`
  position: absolute;
  left: 6.25%;
  width: 87.5%;
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
  border-radius: 4px;
  transition: background 200ms, transform 200ms ease-out;

  ${({ disabled }) =>
    disabled &&
    `
      ${Image} {
        opacity: 0.3;
      }

      :hover ${Image} {
        opacity: 0.6;
      }
    `}

  :hover ${PackInfos} {
    visibility: visible;
  }

  ${({ theme }) => theme.media.computer`
    :hover {
      background: ${({ theme }) => theme.bg3}80;
      transform: translateY(-8px) scale(1.02);
    }
  `}
`

export type PackState = 'opened' | 'inDelivery' | 'delivered' | 'buyable'

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
  slug,
  name,
  releaseDate,
  pictureUrl,
  soldout = false,
  width,
  state = 'delivered',
  isOwner = false,
}: PackProps) {
  const locale = useActiveLocale()

  const releaseDateFormatted = useMemo(() => {
    const releaseMoment = moment(releaseDate)
    releaseMoment.locale(locale)

    const lowerCasedDate = releaseMoment.format('MMMM YYYY')
    return lowerCasedDate.charAt(0).toUpperCase() + lowerCasedDate.slice(1)
  }, [releaseDate, locale])

  const packLink = useMemo(
    () => (isOwner && state === 'delivered' ? `/pack/${slug}/open` : `/pack/${slug}`),
    [state, slug, isOwner]
  )

  const disabled = useMemo(() => state === 'inDelivery' || state === 'opened', [state])

  return (
    <Link href={packLink}>
      <StyledPack width={width} disabled={disabled}>
        <ImageWrapper>
          <Image src={pictureUrl} />
          {state === 'inDelivery' && <InDelivery src={`/assets/delivery.${locale}.png`} />}
          {soldout && <Soldout src={`/assets/soldout.png`} />}
        </ImageWrapper>

        {name && (
          <PackInfos>
            <TYPE.body textAlign="center" fontWeight={500}>
              {name}
            </TYPE.body>
            <TYPE.subtitle textAlign="center">
              <Trans>Edited in {releaseDateFormatted}</Trans>
            </TYPE.subtitle>
          </PackInfos>
        )}
      </StyledPack>
    </Link>
  )
}