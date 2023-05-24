import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'
import { QRCodeSVG } from 'qrcode.react'

import useTheme from '@/hooks/useTheme'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import Input from '@/components/Input'
import useNewTwoFactorAuthSecret from '@/hooks/useNewTwoFactorAuthSecret'
import { TWO_FACTOR_AUTH_CODE_LENGTH } from '@/constants/misc'
import { RowCenter } from '../Row'
import useCurrentUser from '@/hooks/useCurrentUser'
import { useSetTwoFactorAuthSecret } from '@/graphql/data/Auth'

const TwoFactorSetter = styled(RowCenter)`
  gap: 32px;

  ${({ theme }) => theme.media.small`
    flex-direction: column;
  `}
`

const CodeInput = styled(Input)`
  max-width: 100px;
  height: 42px;
`

const QRCodeWrapper = styled.div`
  background: ${({ theme }) => theme.black}20;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 6px;

  & > svg {
    margin: 0 auto;
    display: block;
  }
`

export default function TwoFactorStatus() {
  // currentUser
  const { currentUser, refreshCurrentUser } = useCurrentUser()

  // theme
  const theme = useTheme()

  // otp secret
  const newTwoFactorAuthSecret = useNewTwoFactorAuthSecret()
  const [twoFactorAuthSecret, setTwoFactorAuthSecret] = useState<any | null>(null)

  useEffect(() => {
    if (twoFactorAuthSecret || currentUser?.hasTwoFactorAuthActivated) return
    setTwoFactorAuthSecret(newTwoFactorAuthSecret())
  }, [twoFactorAuthSecret])

  // graphql mutations
  const [setTwoFactorAuthSecretMutation, { loading, error }] = useSetTwoFactorAuthSecret()

  // set 2fa secret
  const handleSetTwoFactorAuthSecret = useCallback(
    async (code: string) => {
      if (!twoFactorAuthSecret) return

      const { success } = await setTwoFactorAuthSecretMutation({ variables: { secret: twoFactorAuthSecret.raw, code } })

      if (success) refreshCurrentUser()
    },
    [twoFactorAuthSecret, setTwoFactorAuthSecretMutation, refreshCurrentUser]
  )

  // fields
  const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('')
  const onTwoFactorAuthInput = useCallback(
    (code: string) => {
      if (/^[\d]*$/.test(code) && code.length <= TWO_FACTOR_AUTH_CODE_LENGTH) {
        setTwoFactorAuthCode(code)
        if (code.length === TWO_FACTOR_AUTH_CODE_LENGTH) handleSetTwoFactorAuthSecret(code)
      }
    },
    [setTwoFactorAuthCode, handleSetTwoFactorAuthSecret]
  )

  return (
    <Column gap={32}>
      <TYPE.body>
        <Trans>
          Two-Factor Authentication adds an additional layer of security to your account by requiring a code when you
          sign in.
        </Trans>
      </TYPE.body>

      {!currentUser?.hasTwoFactorAuthActivated && (
        <TwoFactorSetter>
          <QRCodeWrapper>
            <QRCodeSVG value={twoFactorAuthSecret?.url ?? ''} bgColor={`${theme.bg1}`} fgColor={theme.text1} />
          </QRCodeWrapper>

          <Column gap={16}>
            <TYPE.subtitle>
              <Trans>
                Scan this QR Code with your authenticator app and enter the verification code below to setup the
                Two-Factor Authentication on your Rules account.
              </Trans>
            </TYPE.subtitle>

            <CodeInput
              id="twoFactorAuthCode"
              value={twoFactorAuthCode}
              placeholder={t`Code`}
              type="text"
              onUserInput={onTwoFactorAuthInput}
              loading={loading}
              $valid={error?.id !== 'twoFactorAuthCode'}
            />
          </Column>
        </TwoFactorSetter>
      )}

      {error?.render()}
    </Column>
  )
}
