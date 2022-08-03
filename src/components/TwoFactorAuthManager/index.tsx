import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { QRCodeSVG } from 'qrcode.react'

import useTheme from '@/hooks/useTheme'
import Card from '@/components/Card'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import Input from '@/components/Input'
import useNewTwoFactorAuthSecret from '@/hooks/useNewTwoFactorAuthSecret'
import { TWO_FACTOR_AUTH_CODE_LENGTH } from '@/constants/misc'
import { useSetTwoFactorAuthSecretMutation } from '@/state/auth/hooks'
import { useCurrentUser, useQueryCurrentUser } from '@/state/user/hooks'

const StyledTwoFactorAuthManager = styled(Card)`
  margin: 0;
  padding: 64px;
  width: 100%;

  ${({ theme }) => theme.media.medium`
    height: 100%;
    padding: 28px;
  `}
`

const TwoFactorAuthSetter = styled(Column)`
  max-width: 350px;
  margin: 16px auto 0;
`

const QRCodeWrapper = styled.div`
  background: ${({ theme }) => theme.bg3}80;
  padding: 24px 0;
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 4px;

  & > svg {
    margin: 0 auto;
    display: block;
  }
`

const Enabled = styled(TYPE.body)`
  background: ${({ theme }) => theme.primary1};
  padding: 0 8px;
  border-radius: 2px;
  font-weight: 400;
`

export default function TwoFactorAuthManager() {
  // currentUser
  const currentUser = useCurrentUser()
  const queryCurrentUser = useQueryCurrentUser()

  // theme
  const theme = useTheme()

  // otp secret
  const newTwoFactorAuthSecret = useNewTwoFactorAuthSecret()
  const [twoFactorAuthSecret, setTwoFactorAuthSecret] = useState()

  useEffect(() => {
    if (twoFactorAuthSecret || currentUser.hasTwoFactorAuthActivated) return
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
        .then(() => {
          setLoading(false)
          queryCurrentUser()
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
    <StyledTwoFactorAuthManager>
      <Column gap={32}>
        <Column gap={16}>
          <TYPE.large>
            <Trans>Two-Factor Authentication</Trans>
          </TYPE.large>
          <TYPE.body>
            <Trans>
              Two-factor authentication adds an additional layer of security to your account by requiring more than just
              a password to sign in.
            </Trans>
          </TYPE.body>
          {currentUser.hasTwoFactorAuthActivated ? (
            <Enabled>
              <Trans>Enabled</Trans>
            </Enabled>
          ) : (
            <TwoFactorAuthSetter gap={16}>
              <TYPE.subtitle>
                <Trans>
                  Scan this QR Code with your authenticator app and enter the verification code below to setup the
                  two-factor authentication on your Rules account
                </Trans>
              </TYPE.subtitle>

              <QRCodeWrapper>
                <QRCodeSVG value={twoFactorAuthSecret?.url ?? ''} bgColor={`${theme.bg3}80`} fgColor={theme.text1} />
              </QRCodeWrapper>

              <Input
                id="twoFactorAuthCode"
                value={twoFactorAuthCode}
                placeholder="Code"
                type="text"
                onUserInput={onTwoFactorAuthInput}
                loading={(twoFactorAuthCode.length > 0 && loading) || !twoFactorAuthSecret}
                $valid={error.id !== 'twoFactorAuthCode' || loading}
              />

              {error.message && (
                <Trans
                  id={error.message}
                  render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>}
                />
              )}
            </TwoFactorAuthSetter>
          )}
        </Column>
      </Column>
    </StyledTwoFactorAuthManager>
  )
}
