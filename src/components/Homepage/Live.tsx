import styled from 'styled-components'

import { TYPE } from '@/styles/theme'

const StyledLive = styled.div`
  padding: 20px;
`

export default function Live() {
  return (
    <StyledLive>
      <TYPE.body>content</TYPE.body>
    </StyledLive>
  )
}
