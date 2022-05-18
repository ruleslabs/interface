import React from 'react'
import styled from 'styled-components'

const StyledPackOpeningLayout = styled.div`
  background: #000;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`

export default function PackOpeningLayout({ children }: { children: React.ReactElement }) {
  return <StyledPackOpeningLayout>{children}</StyledPackOpeningLayout>
}
