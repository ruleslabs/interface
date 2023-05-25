import React from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { RowBetween } from 'src/components/Row'
import LanguageSelector from 'src/components/LanguageSelector'
import { TYPE } from 'src/styles/theme'
import Link from 'src/components/Link'

const StyledFooter = styled.footer`
  height: 80px;
  margin-top: 32px;
  position: absolute;
  bottom: -${({ theme }) => theme.size.footerHeight}px;
  left: 0;
  right: 0;
`

const FooterWrapper = styled(RowBetween)`
  padding: 0 32px;
  gap: 32px;
  width: 100%;
  height: 100%;
  align-items: center;

  ${({ theme }) => theme.media.medium`
    padding: 0 16px;
  `}

  ${({ theme }) => theme.media.small`
    flex-direction: column-reverse;
    gap: unset;
    justify-content: space-around;
  `}
`

const LegalText = styled(TYPE.subtitle)`
  ${({ theme }) => theme.media.small`
    text-align: center;
    padding-bottom: 12px;
  `}
`

export default function Footer({ children }: React.HTMLAttributes<HTMLDivElement>) {
  const separator = ' - '

  return (
    <StyledFooter>
      <FooterWrapper>
        <LegalText>
          <Trans>
            © Rules 2023 -&nbsp;
            <Link href="/terms" target="_blank" color="text2" underline>
              Terms & Conditions
            </Link>
            {separator}
            <Link href="/privacy" target="_blank" color="text2" underline>
              Confidentiality
            </Link>
            {separator}
            <Link href="/cookies" target="_blank" color="text2" underline>
              Cookies
            </Link>
            {separator}
            Contact:&nbsp;
            <Link href="mailto:support@rules.art" color="text2" underline>
              support@rules.art
            </Link>
          </Trans>
        </LegalText>

        <LanguageSelector />
      </FooterWrapper>

      {children}
    </StyledFooter>
  )
}
