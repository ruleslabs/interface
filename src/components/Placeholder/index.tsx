import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

const Placeholder = styled(TYPE.body)`
  text-align: center;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.text2};
  color: ${({ theme }) => theme.text2};
  border-radius: 6px;
  padding: 12px;
`

export default Placeholder
