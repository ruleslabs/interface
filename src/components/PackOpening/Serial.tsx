import React from 'react'
import styled from 'styled-components'

import { TYPE } from '@/styles/theme'

const StyledSerial = styled.div`
  display: flex;
  justify-content: space-around;
  position: absolute;
  width: 100%;

  & * {
    font-family: 'Archivo Black', sans-serif;
  }
`

const SerialFill = styled(TYPE.body)`
  font-size: 40px;
  position: absolute;
  top: 20px;
`

const SerialStroke = styled(TYPE.body)`
  font-size: 80px;
  color: ${({ theme }) => theme.bg1};
  text-shadow: ${({ theme }) =>
    `1px 0 ${theme.text2}, -1px 0 ${theme.text2}, 0 1px ${theme.text2}, 0 -1px ${theme.text2}`};
`

interface SerialProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export default function Serial({ children, ...props }: SerialProps) {
  return (
    <StyledSerial {...props}>
      <SerialStroke>{children}</SerialStroke>
      <SerialFill>{children}</SerialFill>
    </StyledSerial>
  )
}
