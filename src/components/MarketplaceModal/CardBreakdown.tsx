import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import Column from '@/components/Column'
import Row, { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import Tag from '@/components/Tag'

const StyledCardBreakdown = styled(RowCenter)`
  gap: 16px;
  background: ${({ theme }) => theme.bg5};
  width: 100%;
  padding: 12px;

  & img {
    width: 64px;
    border-radius: 4px;
  }
`

const SerialNumbersWrapper = styled(Row)`
  gap: 4px;
  flex-wrap: wrap;
`

interface CardBreakdownProps {
  pictureUrl: string
  season: number
  artistName: string
  scarcityName: string
  serialNumbers: number[]
}

export default function CardBreakdown({
  pictureUrl,
  season,
  artistName,
  scarcityName,
  serialNumbers,
}: CardBreakdownProps) {
  return (
    <StyledCardBreakdown>
      <img src={pictureUrl} />
      <Column gap={8}>
        <TYPE.medium>
          {artistName} S{season}&nbsp;
          <Trans id={scarcityName} render={({ translation }) => <>{translation}</>} />
        </TYPE.medium>

        <SerialNumbersWrapper gap={4}>
          {serialNumbers.map((serialNumber) => (
            <Tag key={serialNumber}>#{serialNumber}</Tag>
          ))}
        </SerialNumbersWrapper>
      </Column>
    </StyledCardBreakdown>
  )
}
