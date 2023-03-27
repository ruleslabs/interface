import styled from 'styled-components'

import { TYPE } from '@/styles/theme'

const LongHexWrapper = styled.div`
  background: ${({ theme }) => theme.bg3}40;
  border: 1px solid ${({ theme }) => theme.bg3}80;
  border-radius: 3px;
  padding: 8px;
  width: fit-content;

  & * {
    word-break: break-all;
  }
`

interface LongHexProps {
  value: string
}

export default function LongHex({ value }: LongHexProps) {
  return (
    <LongHexWrapper>
      <TYPE.body>{value}</TYPE.body>
    </LongHexWrapper>
  )
}
