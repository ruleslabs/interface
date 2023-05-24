import { useState, useCallback } from 'react'
import { Trans } from '@lingui/macro'

import { ModalHeader } from '@/components/Modal'
import { ModalBody } from '@/components/Modal/Classic'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { AuthMode } from '@/state/auth/actions'
import { useAuthModalToggle } from '@/state/application/hooks'
import { useSetAuthMode, useTwoFactorAuthToken } from '@/state/auth/hooks'
import { TWO_FACTOR_AUTH_CODE_LENGTH } from '@/constants/misc'
import { AuthFormProps } from './types'
import { useTwoFactorAuthSignIn } from '@/graphql/data/Auth'

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
