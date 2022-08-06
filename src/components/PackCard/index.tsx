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
  transition: transform 100ms;
  gap: 16px;
  ${({ width }) => width && `width: ${width}px;`}
`

const Card = styled.img<{ state: string }>`
  width: 100%;

  ${({ state }) => state === 'preparingOpening' && 'opacity: 0.3;'}
`

const StatusStyle = css`
  position: absolute;
  left: 6.25%;
  width: 87.5%;
  top: 40%;
`

const InDelivery = styled.img`
  ${StatusStyle}
`

const Soldout = styled.img`
  ${StatusStyle}
`

const StyledLargeSpinner = styled(LargeSpinner)`
  position: absolute;
  left: 35.6%;
  top: 34.7%;
`

const PrepareOpeningButton = styled(PrimaryButton)`
  ${StatusStyle}
  top: 37.1%;
  display: none;
`

interface CustomPackCardProps {
  children: React.ReactNode
  href?: string
}

const CustomPackCard = ({ href, ...props }: CustomPackCardProps) => {
  return href ? <Link href={href} {...props} /> : <div {...props} />
}

const StyledCustomPackCard = styled(CustomPackCard)<{ state: string }>`
  cursor: pointer;

  &:hover button {
    display: block;
  }

  ${({ state }) =>
    state === 'delivered' &&
    `
      cursor: default;

      &:hover img {
        opacity: 0.3;
      }
    `}
`

interface PackCardProps {
  slug: string
  name?: string
  releaseDate: Date
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
    console.log(locale)

    return releaseMoment.format('MMMM YYYY')
  }, [releaseDate, locale])

  const actionProps = useMemo(() => {
    if (!isOwner) return { href: `/pack/${slug}` }

    switch (state) {
      case 'inDelivery':
      case 'buyable':
      case 'preparingOpening':
        return { href: `/pack/${slug}` }
      case 'delivered':
        return {}
      case 'readyToOpen':
        return { href: `/pack/${slug}/open` }
    }

    return {}
  }, [state])

  return (
    <StyledPackCard width={width}>
      <StyledCustomPackCard {...actionProps} state={state}>
        <Card src={pictureUrl} state={state} />
        {state === 'inDelivery' && <InDelivery src={`/assets/delivery.${locale}.png`} />}
        {soldout && <Soldout src={`/assets/soldout.png`} />}
        {isOwner && state === 'preparingOpening' && <StyledLargeSpinner />}
        {isOwner && state === 'delivered' && (
          <PrepareOpeningButton onClick={onOpeningPreparation} large>
            <Trans>Open pack</Trans>
          </PrepareOpeningButton>
        )}
      </StyledCustomPackCard>
      {name && (
        <ColumnCenter gap={4}>
          {!isOwner || state === 'delivered' || state === 'inDelivery' ? (
            <>
              <TYPE.body>{name}</TYPE.body>
              <TYPE.subtitle>
                <Trans>Edited in {releaseDateFormatted}</Trans>
              </TYPE.subtitle>
            </>
          ) : state === 'preparingOpening' ? (
            <>
              <TYPE.body>
                <Trans>Opening the pack...</Trans>
              </TYPE.body>
              <TYPE.subtitle>
                <Trans>Please come back later.</Trans>
              </TYPE.subtitle>
            </>
          ) : (
            <>
              <TYPE.body>
                <Trans>Opening ready.</Trans>
              </TYPE.body>
              <TYPE.subtitle>
                <Trans>Click to see your cards.</Trans>
              </TYPE.subtitle>
            </>
          )}
        </ColumnCenter>
      )}
    </StyledPackCard>
  )
}
