import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import GoogleLogin from 'react-google-login'
import { ApolloError } from '@apollo/client'
import { Trans, t } from '@lingui/macro'

import { ModalHeader } from '@/components/Modal'
import { ModalContent, ModalBody } from '@/components/Modal/Classic'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { PrimaryButton, CustomGoogleLogin } from '@/components/Button'
import { AuthMode } from '@/state/auth/actions'
import {
  useAuthForm,
  useAuthActionHanlders,
  useSetAuthMode,
  useSetTwoFactorAuthToken,
} from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import Separator from '@/components/Text/Separator'
import { passwordHasher } from '@/utils/password'
import { AuthFormProps } from './types'
import { useSignIn } from '@/graphql/data/Auth'

const StyledForm = styled.form`
  width: 100%;
`

const SwitchAuthModeButton = styled(TYPE.subtitle)`
  display: inline;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
`

const SubmitButton = styled(PrimaryButton)`
  height: 55px;
  margin: 12px 0;
`

export default function SignInForm({ onSuccessfulConnection }: AuthFormProps) {
  // graphql
  const [signInMutation, { data: signIn, loading, error }] = useSignIn()

  // fields
  const { email, password } = useAuthForm()
  const { onEmailInput, onPasswordInput } = useAuthActionHanlders()

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // actions
  const setTwoFactorAuthToken = useSetTwoFactorAuthToken()

  // signin
  const handleSignIn = useCallback(
    async (event) => {
      event.preventDefault()

      const hashedPassword = await passwordHasher(password)

      signInMutation({ variables: { email, password: hashedPassword } })
    },
    [email, password, signInMutation, onSuccessfulConnection, setTwoFactorAuthToken, setAuthMode]
  )

  useEffect(() => {
    if (signIn.accessToken) {
      onSuccessfulConnection({ accessToken: signIn.accessToken })
    } else if (signIn.twoFactorAuthToken) {
      setTwoFactorAuthToken(signIn.twoFactorAuthToken)
      setAuthMode(AuthMode.TWO_FACTOR_AUTH)
    }
  }, [signIn.accessToken, signIn.twoFactorAuthToken, onSuccessfulConnection, setTwoFactorAuthToken, setAuthMode])

  return (
    <ModalContent>
      <ModalHeader onDismiss={toggleAuthModal} title={t`Connection`} />

      <ModalBody>
        <StyledForm key="sign-in-form" onSubmit={handleSignIn} noValidate>
          <Column gap={20}>
            <Column gap={12}>
              <Input
                id="email"
                value={email}
                placeholder="E-mail"
                type="email"
                autoComplete="email"
                onUserInput={onEmailInput}
                $valid={error?.id !== 'email'}
              />
              <Input
                id="password"
                value={password}
                placeholder={t`Password`}
                type="password"
                autoComplete="current-password"
                onUserInput={onPasswordInput}
                $valid={error?.id !== 'password'}
              />

              {error?.render()}
            </Column>

            <SubmitButton type="submit" large>
              {loading ? 'Loading ...' : t`Sign in`}
            </SubmitButton>
          </Column>
        </StyledForm>

        <Column gap={12} style={{ padding: '0 8px' }}>
          <TYPE.subtitle onClick={() => setAuthMode(AuthMode.REQUEST_PASSWORD_UPDATE)} clickable>
            <Trans>Forgot your password?</Trans>
          </TYPE.subtitle>
          <TYPE.subtitle>
            <Trans>
              No account?&nbsp;
              <SwitchAuthModeButton onClick={() => setAuthMode(AuthMode.SIGN_UP)}>Join Rules</SwitchAuthModeButton>
            </Trans>
          </TYPE.subtitle>
        </Column>
      </ModalBody>
    </ModalContent>
  )
}
