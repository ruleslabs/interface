import styled from 'styled-components'

import LanguageSelector from '@/components/LanguageSelector'

const StyledFooter = styled.footer`
  height: 80px;
  background: ${({ theme }) => theme.bg2};
  margin-top: 32px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-around;
  bottom: -128px; // 80 + 48
  left: 0;
  right: 0;
`

export default function Footer() {
  return (
    <StyledFooter>
      <LanguageSelector />
    </StyledFooter>
  )
}
