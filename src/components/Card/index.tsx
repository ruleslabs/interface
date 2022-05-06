import styled from 'styled-components'

const Card = styled.div`
  padding: 22px 32px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 3px;
  width: 100%;

  ${({ theme }) => theme.media.small`
    padding: 22px 26px;
  `}
`

export default Card
