import styled from 'styled-components'

import { TYPE } from '@/styles/theme'

const ErrorCard = styled(TYPE.body)`
  background: ${({ theme }) => theme.error}26;
  border: 1px solid ${({ theme }) => theme.error};
  border-radius: 3px;
  padding: 24px 36px;
  width: 100%;

  span {
    text-decoration: underline;
    cursor: pointer;
  }
`

export default ErrorCard
