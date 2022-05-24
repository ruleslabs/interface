import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { RowBetween } from '@/components/Row'
import LanguageSelector from '@/components/LanguageSelector'
import { TYPE } from '@/styles/theme'
import Link from '@/components/Link'

const StyledFooter = styled.footer`
  height: 80px;
  margin-top: 32px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-around;
  bottom: -128px; // 80 + 48
  left: 0;
  right: 0;
`

const FooterWrapper = styled(RowBetween)`
  padding: 0 32px;
  gap: 32px;
  width: 100%;
  align-items: center;

  ${({ theme }) => theme.media.medium`
    padding: 0 16px;
  `}

  ${({ theme }) => theme.media.small`
    flex-direction: column-reverse;
    gap: 16px;
  `}
`

const LegalText = styled(TYPE.subtitle)`
  ${({ theme }) => theme.media.small`
    text-align: center;
    padding-bottom: 12px;
  `}
`

export default function Footer() {
  const separator = ' - '

  return (
    <StyledFooter>
      <FooterWrapper>
        <LegalText>
          <Trans>
            (c) Rules 2022 -&nbsp;
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
            Support:&nbsp;
            <Link href="mailto:support@rules.art" color="text2" underline>
              support@rules.art
            </Link>
          </Trans>
        </LegalText>
        <LanguageSelector />
      </FooterWrapper>
    </StyledFooter>
  )
}
