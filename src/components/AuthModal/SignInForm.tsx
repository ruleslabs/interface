import { t, Trans } from '@lingui/macro'
import { useCallback } from 'react'
import { PrimaryButton } from 'src/components/Button'
import Column from 'src/components/Column'
import Input from 'src/components/Input'
import { ModalHeader } from 'src/components/Modal'
import { ModalBody } from 'src/components/Modal/Classic'
import { useSignIn } from 'src/graphql/data/Auth'
import { useAuthModalToggle } from 'src/state/application/hooks'
import { AuthMode } from 'src/state/auth/actions'
import { useAuthActionHanlders, useAuthForm, useSetAuthMode, useSetTwoFactorAuthToken } from 'src/state/auth/hooks'
import { TYPE } from 'src/styles/theme'
import { passwordHasher } from 'src/utils/password'
import styled from 'styled-components/macro'

import { AuthFormProps } from './types'

const StyledForm = styled.form`
  width: 100%;
`

const SubmitButton = styled(PrimaryButton)`
  height: 55px;
  margin: 12px 0;
`

export default function SignInForm({ onSuccessfulConnection }: AuthFormProps) {
  // graphql
  const [signInMutation, { loading, error }] = useSignIn()

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

      const { accessToken, twoFactorAuthToken } = await signInMutation({
        variables: { email, password: hashedPassword },
      })

      if (accessToken) {
        onSuccessfulConnection({ accessToken })
      } else if (twoFactorAuthToken) {
        setTwoFactorAuthToken(twoFactorAuthToken)
        setAuthMode(AuthMode.TWO_FACTOR_AUTH)
      }
    },
    [email, password, signInMutation, onSuccessfulConnection, setTwoFactorAuthToken, setAuthMode]
  )

  return (
    <>
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
        </Column>
      </ModalBody>
    </>
  )
}
