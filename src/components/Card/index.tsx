import styled from 'styled-components'

const Card = styled.div<{ width?: string }>`
  padding: 22px 32px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 3px;
  ${({ width }) => (width ? `width: ${width};` : '')}
`

export default Card
