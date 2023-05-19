import { useState, useCallback } from 'react'
import { Trans } from '@lingui/macro'
import { ApolloError } from '@apollo/client'

import { ModalHeader } from '@/components/Modal'
import { ModalContent, ModalBody } from '@/components/Modal/Classic'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { AuthMode } from '@/state/auth/actions'
import { useAuthModalToggle } from '@/state/application/hooks'
import { useSetAuthMode, useTwoFactorAuthSignInMutation, useTwoFactorAuthToken } from '@/state/auth/hooks'
import { TWO_FACTOR_AUTH_CODE_LENGTH } from '@/constants/misc'
import { AuthFormProps } from './types'

export default function TwoFactorAuthForm({ onSuccessfulConnection }: AuthFormProps) {
  // Loading
  const [loading, setLoading] = useState(false)

  // graphql
  const [twoFactorAuthSignInMutation] = useTwoFactorAuthSignInMutation()

  // form data
  const twoFactorAuthToken = useTwoFactorAuthToken()

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // errors
  const [error, setError] = useState<{ message?: string; id?: string }>({})

  // signin
  const handleTwoFactorAuthSignIn = useCallback(
    async (code: string) => {
      setLoading(true)

      twoFactorAuthSignInMutation({ variables: { token: twoFactorAuthToken, code } })
        .then((res: any) => onSuccessfulConnection({ accessToken: res?.data?.signUp?.accessToken }))
        .catch((twoFactorAuthSignInError: ApolloError) => {
          const error = twoFactorAuthSignInError?.graphQLErrors?.[0]
          if (error) setError({ message: error.message, id: error.extensions?.id as string })
          else if (!loading) setError({})

          console.error(twoFactorAuthSignInError)
          setLoading(false)
        })
    },
    [twoFactorAuthToken, twoFactorAuthSignInMutation, onSuccessfulConnection, setLoading]
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
    <ModalContent>
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
              loading={twoFactorAuthCode.length > 0 && loading}
              $valid={error.id !== 'twoFactorAuthCode' || loading}
            />

            {error.message && (
              <Trans
                id={error.message}
                render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>}
              />
            )}

            <TYPE.subtitle onClick={() => setAuthMode(AuthMode.REQUEST_TWO_FACTOR_AUTH_UPDATE)} clickable>
              <Trans>Lost your 2FA access ?</Trans>
            </TYPE.subtitle>
          </Column>
        </Column>
      </ModalBody>
    </ModalContent>
  )
}
