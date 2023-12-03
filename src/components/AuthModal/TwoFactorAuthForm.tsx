import { Trans } from '@lingui/macro'
import { useCallback, useState } from 'react'
import Column from 'src/components/Column'
import Input from 'src/components/Input'
import { ModalHeader } from 'src/components/Modal'
import { ModalBody } from 'src/components/Modal/Classic'
import { TWO_FACTOR_AUTH_CODE_LENGTH } from 'src/constants/misc'
import { useTwoFactorAuthSignIn } from 'src/graphql/data/Auth'
import { useAuthModalToggle } from 'src/state/application/hooks'
import { AuthMode } from 'src/state/auth/actions'
import { useSetAuthMode, useTwoFactorAuthToken } from 'src/state/auth/hooks'
import { TYPE } from 'src/styles/theme'

import { AuthFormProps } from './types'

export default function TwoFactorAuthForm({ onSuccessfulConnection }: AuthFormProps) {
  // graphql
  const [twoFactorAuthSignInMutation, { loading, error }] = useTwoFactorAuthSignIn()

  // form data
  const twoFactorAuthToken = useTwoFactorAuthToken()

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // signin
  const handleTwoFactorAuthSignIn = useCallback(
    async (code: string) => {
      if (!twoFactorAuthToken) return

      const { accessToken } = await twoFactorAuthSignInMutation({ variables: { token: twoFactorAuthToken, code } })

      if (accessToken) onSuccessfulConnection({ accessToken })
    },
    [twoFactorAuthToken, twoFactorAuthSignInMutation, onSuccessfulConnection]
  )

  // fields
  const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('')
  const onTwoFactorAuthInput = useCallback(
    (code: string) => {
      if (/^[\d]*$/.test(code) && code.length <= TWO_FACTOR_AUTH_CODE_LENGTH) {
        setTwoFactorAuthCode(code)
        if (code.length === TWO_FACTOR_AUTH_CODE_LENGTH) handleTwoFactorAuthSignIn(code)
      }
    },
    [setTwoFactorAuthCode]
  )

  return (
    <>
      <ModalHeader onDismiss={toggleAuthModal} onBack={() => setAuthMode(AuthMode.SIGN_IN)} />

      <ModalBody>
        <Column gap={26}>
          <TYPE.large>
            <Trans>Enter the 2FA code to sign in</Trans>
          </TYPE.large>

          <Column gap={12}>
            <Input
              id="twoFactorAuthCode"
              value={twoFactorAuthCode}
              placeholder="Code"
              type="text"
              onUserInput={onTwoFactorAuthInput}
              loading={loading}
              $valid={error?.id !== 'twoFactorAuthCode'}
            />

            {error?.render()}

            <TYPE.subtitle onClick={() => setAuthMode(AuthMode.REQUEST_TWO_FACTOR_AUTH_UPDATE)} clickable>
              <Trans>Lost your 2FA access ?</Trans>
            </TYPE.subtitle>
          </Column>
        </Column>
      </ModalBody>
    </>
  )
}
