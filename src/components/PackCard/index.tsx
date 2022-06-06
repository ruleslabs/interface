import styled from 'styled-components'

import Link from '@/components/Link'
import { TYPE } from '@/styles/theme'
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

const Soldout = styled(TYPE.body)`
  padding: 6px 0;
  text-align: center;
  background: ${({ theme }) => theme.bg2};
  position: absolute;
  top: 40%;
  left: -100%;
  right: -100%;
  margin-left: auto;
  margin-right: auto;
  width: 230px;
  font-style: italic;
  font-weight: 700;
  font-size: 40px;
  transform: rotate(-10deg);
  white-space: nowrap;
`

const InDelivery = styled.img`
  position: absolute;
  left: 15px;
  width: calc(100% - 30px);
  top: 40%;
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
        {soldout && <Soldout>SOLD OUT</Soldout>}
      </Link>
    </StyledPackCard>
  )
}
