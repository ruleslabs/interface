import styled from 'styled-components'

import { TYPE } from '@/styles/theme'

const ErrorCard = styled(TYPE.body)`
  background: ${({ theme }) => theme.error}20;
  border-radius: 3px;
  padding: 16px;
  width: 100%;
  text-align: center;

  span {
    text-decoration: underline;
    cursor: pointer;
  }
`

export default ErrorCard
