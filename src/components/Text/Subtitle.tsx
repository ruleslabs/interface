import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

const StyledSubtitle = styled(TYPE.medium)`
  font-size: 16px;
  margin-left: 4px;
`

interface SubtitleProps {
  value: string
}

export default function Subtitle({ value }: SubtitleProps) {
  return <StyledSubtitle fontSize={16}>{value}</StyledSubtitle>
}
