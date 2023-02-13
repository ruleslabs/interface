import 'moment/locale/fr'

import { useMemo } from 'react'
import moment from 'moment'
import styled, { css } from 'styled-components'
import { Trans } from '@lingui/macro'

import Link from '@/components/Link'
import { useActiveLocale } from '@/hooks/useActiveLocale'
import { TYPE } from '@/styles/theme'
import { ColumnCenter } from '@/components/Column'
import { LargeSpinner } from '@/components/Spinner'
import { PrimaryButton } from '@/components/Button'

const StyledPackCard = styled(ColumnCenter)<{ width?: number }>`
  position: relative;
  gap: 16px;
  ${({ width }) => width && `width: ${width}px;`}
`

const Card = styled.img`
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

const StyledLargeSpinner = styled(LargeSpinner)`
  position: absolute;
  width: 26.8%;
  height: auto;
  left: 35.6%;
  top: 40.7%;
`

const PrepareOpeningButton = styled(PrimaryButton)`
  ${StatusStyle}
  top: 42.6%;
  display: none;
`

interface CustomPackCardProps {
  children: React.ReactNode
  href?: string
}

const CustomPackCard = ({ href, ...props }: CustomPackCardProps) => {
  return href ? <Link href={href} {...props} /> : <div {...props} />
}

const StyledCustomPackCard = styled(CustomPackCard)<{ active: boolean }>`
  cursor: pointer;
  transform: perspective(0);

  & img {
    transition: transform 100ms, opacity 100ms;
  }

  &:hover button {
    display: block;
  }

  ${({ active }) =>
    active
      ? `
        &:hover img {
          transform: perspective(400px) rotateY(10deg);
        }
      `
      : `
        & ${Card} {
          opacity: 0.3;
        }
      `}
`

interface PackCardProps {
  slug: string
  name?: string
  releaseDate?: Date
  pictureUrl: string
  soldout?: boolean
  width?: number
  state?: string
  isOwner?: boolean
  onOpeningPreparation?: () => void
}

export default function PackCard({
  slug,
  name,
  releaseDate,
  pictureUrl,
  soldout = false,
  width,
  state = 'delivered',
  isOwner = false,
  onOpeningPreparation,
}: PackCardProps) {
  const locale = useActiveLocale()

  const releaseDateFormatted = useMemo(() => {
    const releaseMoment = moment(releaseDate)
    releaseMoment.locale(locale)

    const lowerCasedDate = releaseMoment.format('MMMM YYYY')
    return lowerCasedDate.charAt(0).toUpperCase() + lowerCasedDate.slice(1)
  }, [releaseDate, locale])

  const actionProps = useMemo(() => {
    if (!isOwner) return { href: `/pack/${slug}` }

    switch (state) {
      case 'inDelivery':
      case 'buyable':
        return { href: `/pack/${slug}` }
      case 'delivered':
        return { href: `/pack/${slug}/open` }
    }

    return {}
  }, [state])

  return (
    <StyledPackCard width={width}>
      <StyledCustomPackCard {...actionProps} active={state !== 'inDelivery'}>
        <Card src={pictureUrl} />
        {state === 'inDelivery' && <InDelivery src={`/assets/delivery.${locale}.png`} />}
        {soldout && <Soldout src={`/assets/soldout.png`} />}
      </StyledCustomPackCard>
      {name && (
        <ColumnCenter gap={4}>
          {!isOwner || state === 'delivered' || state === 'inDelivery' ? (
            <>
              <TYPE.body textAlign="center">{name}</TYPE.body>
              <TYPE.subtitle textAlign="center">
                <Trans>Edited in {releaseDateFormatted}</Trans>
              </TYPE.subtitle>
            </>
          ) : (
            <>
              <TYPE.body textAlign="center">
                <Trans>Opening ready.</Trans>
              </TYPE.body>
              <TYPE.subtitle textAlign="center">
                <Trans>Click to see your cards</Trans>
              </TYPE.subtitle>
            </>
          )}
        </ColumnCenter>
      )}
    </StyledPackCard>
  )
}
