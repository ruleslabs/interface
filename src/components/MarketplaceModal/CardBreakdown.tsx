import { Trans } from '@lingui/macro'
import Column from 'src/components/Column'
import Row, { RowCenter } from 'src/components/Row'
import Tag from 'src/components/Tag'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

const StyledCardBreakdown = styled(RowCenter)`
  gap: 16px;
  width: 100%;
  padding: 12px;
  border-radius: 6px;

  & img {
    width: 64px;
    border-radius: 6px;
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
          <Trans id={scarcityName}>{scarcityName}</Trans>
        </TYPE.medium>

        <SerialNumbersWrapper gap={4}>
          {serialNumbers.length ? (
            serialNumbers.map((serialNumber) => <Tag key={serialNumber}>#{serialNumber}</Tag>)
          ) : (
            <Tag>
              <Trans>Random serial</Trans>
            </Tag>
          )}
        </SerialNumbersWrapper>
      </Column>
    </StyledCardBreakdown>
  )
}
