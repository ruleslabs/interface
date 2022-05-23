import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import Row from '@/components/Row'
import { SUPPORTED_LOCALES, LOCALE_LABEL, SupportedLocale } from '@/constants/locales'
import { TYPE } from '@/styles/theme'
import { useUserLocaleManager } from '@/state/user/hooks'

const StyledLanguageSelector = styled(Row)`
  gap: 8px;
  justify-content: center;
`

const LocaleLabel = styled(TYPE.body)<{ active: boolean }>`
  font-size: 20px;
  color: ${({ active, theme }) => (active ? theme.text1 : theme.text2)};
  cursor: pointer;

  :hover {
    color: ${({ theme }) => theme.text1};
  }

  ${({ theme }) => theme.media.medium`
    font-size: 16px;
  `}
`

type LanguageSelectorProps = React.HTMLAttributes<HTMLDivElement>

export default function LanguageSelector(props: LanguageSelectorProps) {
  const [userLocale, setUserLocale] = useUserLocaleManager()
  const router = useRouter()

  const handleLocaleChange = useCallback(
    (locale: SupportedLocale) => {
      const regex = new RegExp(`(?<=\\?|\\&)lng=${userLocale}`, 'g')
      router.replace(router.asPath.replace(regex, ''), undefined, { shallow: true })
      setUserLocale(locale)
    },
    [router, setUserLocale, userLocale]
  )

  return (
    <StyledLanguageSelector {...props}>
      {SUPPORTED_LOCALES.map((locale, index) => (
        <Row key={locale} gap={8}>
          {index ? <TYPE.body color="text2">-</TYPE.body> : null}
          <LocaleLabel active={userLocale === locale} onClick={() => handleLocaleChange(locale)}>
            {LOCALE_LABEL[locale]}
          </LocaleLabel>
        </Row>
      ))}
    </StyledLanguageSelector>
  )
}
