import styled from 'styled-components'

import { TYPE } from '@/styles/theme'

const Tag = styled(TYPE.body)`
  padding: 2px 8px;
  border-radius: 12px;
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg3};
`

export default Tag
