import { useMemo } from 'react'
import styled, { css } from 'styled-components'

import Link from '@/components/Link'
import { useActiveLocale } from '@/hooks/useActiveLocale'

const StyledPackCard = styled.div<{ width?: number }>`
  position: relative;
  cursor: pointer;
  transition: transform 100ms;
  ${({ width }) => width && `width: ${width}px;`}

  &:hover {
    transform: perspective(400px) rotateY(10deg);
  }
`

const Card = styled.img<{ state: boolean }>`
  width: 100%;

  ${({ state }) => {
    switch (state) {
      case 'inDelivery':
      case 'delivered':
        return 'opacity: 0.3;'
      case 'preparingOpening':
        return `
          animation: float 1.2s ease-in-out infinite;

          @keyframes float {
            0% {
              transform: scale(1);
              opacity: 0.7;
            }

            50% {
              transform: scale(0.98);
              opacity: 0.5;
            }

            100% {
              transform: scale(1);
              opacity: 0.7;
            }
          }
        `
    }
  }}
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

interface CustomPackCardProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
}

const CustomPackCard = (props: CustomPackCardProps) => {
  return props.href ? <Link {...props} /> : <div {...props} />
}

interface PackCardProps {
  slug: string
  pictureUrl: string
  soldout?: boolean
  width?: number
  state?: string
  isOwner?: boolean
  onClick?: () => void
}

export default function PackCard({
  slug,
  pictureUrl,
  soldout = false,
  width,
  state = 'delivered',
  isOwner = false,
  onClick,
}: PackCardProps) {
  const locale = useActiveLocale()

  const actionProps = useMemo(() => {
    if (!isOwner) return { href: `/pack/${slug}` }

    switch (state) {
      case 'inDelivery':
      case 'buyable':
        return { href: `/pack/${slug}` }
      case 'delivered':
        return { onClick }
      case 'preparingOpening':
        return {}
      case 'readyToOpen':
        return { href: `/pack/${slug}/open` }
    }
  }, [state, onClick])

  return (
    <StyledPackCard width={width}>
      <CustomPackCard {...actionProps}>
        <Card src={pictureUrl} state={state} />
        {state === 'inDelivery' && <InDelivery src={`/assets/delivery.${locale}.png`} />}
        {soldout && <Soldout src={`/assets/soldout.png`} />}
      </CustomPackCard>
    </StyledPackCard>
  )
}
