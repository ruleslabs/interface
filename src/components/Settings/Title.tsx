import styled from 'styled-components'

import { TYPE } from '@/styles/theme'

const StyledHr = styled.div`
  margin-top: 12px;
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.bg3}80;
`

interface TitleProps {
  value: string
}

export default function Title({ value }: TitleProps) {
  return (
    <div>
      <TYPE.large>{value}</TYPE.large>
      <StyledHr />
    </div>
  )
}
