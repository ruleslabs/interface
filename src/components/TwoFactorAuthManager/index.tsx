import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { QRCodeSVG } from 'qrcode.react'

import useTheme from '@/hooks/useTheme'
import Card from '@/components/Card'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import Input from '@/components/Input'
import { RowCenter } from '@/components/Row'
import useNewTwoFactorAuthSecret from '@/hooks/useNewTwoFactorAuthSecret'
import { TWO_FACTOR_AUTH_CODE_LENGTH } from '@/constants/misc'
import { useSetTwoFactorAuthSecretMutation } from '@/state/auth/hooks'

const StyledSessionsManager = styled(Card)`
  margin: 0;
  padding: 64px;
  width: 100%;

  ${({ theme }) => theme.media.medium`
    height: 100%;
    padding: 28px;
  `}
`

export default function SessionsManager() {
  // theme
  const theme = useTheme()

  // otp secret
  const newTwoFactorAuthSecret = useNewTwoFactorAuthSecret()
  const [twoFactorAuthSecret, setTwoFactorAuthSecret] = useState()

  useEffect(() => {
    if (twoFactorAuthSecret) return
    setTwoFactorAuthSecret(newTwoFactorAuthSecret())
  }, [twoFactorAuthSecret])

  // Loading
  const [loading, setLoading] = useState(false)

  // errors
  const [error, setError] = useState<{ message?: string; id?: string }>({})

  // graphql mutations
  const [setTwoFactorAuthSecretMutation] = useSetTwoFactorAuthSecretMutation()

  // set 2fa secret
  const setTwoFactorAuthSecretToAccount = useCallback(
    (code: string) => {
      if (!twoFactorAuthSecret) return

      setLoading(true)

      setTwoFactorAuthSecretMutation({ variables: { secret: twoFactorAuthSecret.raw, code } })
        .then((res: any) => {
          setLoading(false)
          console.log(res)
        })
        .catch((setTwoFactorAuthSecretError: ApolloError) => {
          const error = setTwoFactorAuthSecretError?.graphQLErrors?.[0]
          if (error) setError({ message: error.message, id: error.extensions?.id as string })
          else if (!loading) setError({})

          console.error(setTwoFactorAuthSecretError)
          setLoading(false)
        })
    },
    [twoFactorAuthSecret, setTwoFactorAuthSecretMutation]
  )

  // fields
  const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('')
  const onTwoFactorAuthInput = useCallback(
    (code: string) => {
      if (/^[\d]*$/.test(code) && code.length <= TWO_FACTOR_AUTH_CODE_LENGTH) {
        setTwoFactorAuthCode(code)
        if (code.length === TWO_FACTOR_AUTH_CODE_LENGTH) setTwoFactorAuthSecretToAccount(code)
      }
    },
    [setTwoFactorAuthCode, setTwoFactorAuthSecretToAccount]
  )

  return (
    <StyledSessionsManager>
      <Column gap={32}>
        <Column gap={16}>
          <TYPE.large>
            <Trans>Two-Factor Authentication</Trans>
          </TYPE.large>
          <TYPE.subtitle>
            <Trans>
              Scan this QR Code with your authenticator app and enter the verification code below to setup the
              two-factor authentication on your Rules account
            </Trans>
          </TYPE.subtitle>

          <RowCenter>
            <QRCodeSVG value={twoFactorAuthSecret?.url ?? ''} bgColor={theme.bg2} fgColor={theme.text1} />
            <Input
              id="twoFactorAuthCode"
              value={twoFactorAuthCode}
              placeholder="Code"
              type="text"
              onUserInput={onTwoFactorAuthInput}
              loading={(twoFactorAuthCode.length > 0 && loading) || !twoFactorAuthSecret}
              $valid={error.id !== 'twoFactorAuthCode' || loading}
            />
          </RowCenter>
        </Column>
      </Column>
    </StyledSessionsManager>
  )
}
