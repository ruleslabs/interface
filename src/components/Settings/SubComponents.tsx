import React from 'react'
import styled from 'styled-components'

import { TYPE } from '@/styles/theme'

const StyledHr = styled.div`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.bg3}80;
`

interface TitleProps {
  value: string
}

export function Title({ value }: TitleProps) {
  return (
    <>
      <TYPE.large>{value}</TYPE.large>
      <StyledHr />
    </>
  )
}
