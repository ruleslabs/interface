import styled from 'styled-components'

import Link from '@/components/Link'
import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'

const StyledCardModel = styled.div<{ width?: number }>`
  position: relative;
  cursor: pointer;
  transition: transform 100ms;
  ${({ width }) => width && `width: ${width}px;`}

  &:hover {
    transform: perspective(400px) rotateY(10deg);
  }
`

const Card = styled.img`
  width: 100%;
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

interface CardModelProps {
  cardModelSlug: string
  pictureUrl: string
  onSale?: boolean
  width?: number
  serialNumber?: number
}

export default function CardModel({ cardModelSlug, pictureUrl, onSale = false, width, serialNumber }: CardModelProps) {
  return (
    <StyledCardModel width={width}>
      <Link href={`/card/${cardModelSlug}${!!serialNumber ? `/${serialNumber}` : ''}`}>
        <Card src={pictureUrl} />
        {onSale && (
          <OnSale>
            <TYPE.medium>EN VENTE</TYPE.medium>
          </OnSale>
        )}
      </Link>
    </StyledCardModel>
  )
}
