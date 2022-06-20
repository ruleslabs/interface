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

const Card = styled.img<{ inDelivery: boolean }>`
  width: 100%;
  ${({ inDelivery }) => inDelivery && 'opacity: 0.3;'}
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

interface PackCardProps {
  slug: string
  pictureUrl: string
  soldout?: boolean
  width?: number
  open?: boolean
  inDelivery?: boolean
}

export default function PackCard({
  slug,
  pictureUrl,
  soldout = false,
  open = false,
  width,
  inDelivery = false,
}: PackCardProps) {
  const locale = useActiveLocale()

  return (
    <StyledPackCard width={width}>
      <Link href={`/pack/${slug}${open ? '/open' : ''}`}>
        <Card src={pictureUrl} inDelivery={inDelivery} />
        {inDelivery && <InDelivery src={`/assets/delivery.${locale}.png`} />}
        {soldout && <Soldout src={`/assets/soldout.png`} />}
      </Link>
    </StyledPackCard>
  )
}
