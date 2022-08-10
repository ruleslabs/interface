import styled, { css } from 'styled-components'
import { Trans } from '@lingui/macro'

import { useActiveLocale } from '@/hooks/useActiveLocale'
import Link from '@/components/Link'
import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'

const StyledCardModel = styled.div<{ width?: number }>`
  position: relative;
  cursor: pointer;
  ${({ width }) => width && `width: ${width}px;`}
  transform: perspective(0);

  &:hover img {
    transition: transform 100ms;
    transform: perspective(400px) rotateY(10deg);
  }
`

const Card = styled.img<{ inDelivery: boolean }>`
  width: 100%;
  ${({ inDelivery }) => inDelivery && 'opacity: 0.3;'}
`

const OnSale = styled(RowCenter)`
  width: 130px;
  height: 35px;
  border-radius: 4px;
  background: #52a05f;
  position: absolute;
  bottom: 24px;
  right: -24px;
  font-style: italic;
  justify-content: center;
`

const StatusStyle = css`
  position: absolute;
  left: 0;
  width: 100%;
  top: 37.2%;
`

const InDelivery = styled.img`
  ${StatusStyle}
`

interface CardModelProps {
  cardModelSlug: string
  pictureUrl: string
  width?: number
  serialNumber?: number
  inDelivery?: boolean
  onSale?: boolean
}

export default function CardModel({
  cardModelSlug,
  pictureUrl,
  width,
  serialNumber,
  onSale = false,
  inDelivery = false,
}: CardModelProps) {
  const locale = useActiveLocale()

  return (
    <StyledCardModel width={width}>
      <Link href={`/card/${cardModelSlug}${!!serialNumber ? `/${serialNumber}` : ''}`}>
        <Card src={pictureUrl} inDelivery={inDelivery} />
        {inDelivery && <InDelivery src={`/assets/delivery.${locale}.png`} />}
        {onSale && (
          <OnSale>
            <TYPE.medium>
              <Trans>ON SALE</Trans>
            </TYPE.medium>
          </OnSale>
        )}
      </Link>
    </StyledCardModel>
  )
}
