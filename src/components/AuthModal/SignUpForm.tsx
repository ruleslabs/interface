import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { ApolloError } from '@apollo/client'
import { Trans } from '@lingui/macro'

import { ModalHeader } from '@/components/Modal'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import { AuthMode } from '@/state/auth/actions'
import {
  useAuthForm,
  useAuthActionHanlders,
  useSetAuthMode,
  useRefreshNewEmailVerificationCodeTime,
  usePrepareSignUpMutation,
} from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import Checkbox from '@/components/Checkbox'
import Link from '@/components/Link'
import { validatePassword, PasswordError } from '@/utils/password'

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

export default function SignUpForm() {
  // Loading
  const [loading, setLoading] = useState(false)

  // graphql
  const [prepareSignUpMutation] = usePrepareSignUpMutation()

  // fields
  const {
    email,
    password,
    username,
    checkboxes: { acceptTos, acceptCommercialEmails },
  } = useAuthForm()
  const { onEmailInput, onPasswordInput, onUsernameInput, onCheckboxChange } = useAuthActionHanlders()

  // checkboxes
  const toggleTosAgreed = useCallback(() => onCheckboxChange('acceptTos', !acceptTos), [acceptTos])
  const toggleEmailAgreed = useCallback(
    () => onCheckboxChange('acceptCommercialEmails', !acceptCommercialEmails),
    [acceptCommercialEmails]
  )

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // Countdown
  const refreshNewEmailVerificationCodeTime = useRefreshNewEmailVerificationCodeTime()

  // errors
  const [error, setError] = useState<{ message?: string; id?: string }>({})

  //signup
  const handleSignUp = useCallback(
    async (event) => {
      event.preventDefault()

      // Check tos
      if (!acceptTos) {
        setError({ message: 'You must accept the terms and conditions' })
        return
      }

      // Check password
      const passwordError = await validatePassword(email, username, password)
      if (passwordError !== null) {
        switch (passwordError) {
          case PasswordError.LENGTH:
            setError({ message: 'Password should be at least 6 characters long' })
            break

          case PasswordError.LEVENSHTEIN:
            setError({ message: 'Password too similar to your email or username' })
            break

          case PasswordError.PWNED:
            setError({ message: 'This password appears in a public data breach, please choose a stronger password' })
            break
        }
        return
      }

      setLoading(true)

      prepareSignUpMutation({ variables: { username, email } })
        .then((res: any) => {
          if (!res?.data?.prepareSignUp?.error) setAuthMode(AuthMode.EMAIL_VERIFICATION)
          else setLoading(false)
          refreshNewEmailVerificationCodeTime()
        })
        .catch((prepareSignUpError: ApolloError) => {
          const error = prepareSignUpError?.graphQLErrors?.[0]
          if (error) setError({ message: error.message, id: error.extensions?.id as string })
          else if (!loading) setError({})

          console.error(prepareSignUpError)
          setLoading(false)
        })
    },
    [email, username, password, prepareSignUpMutation, setAuthMode, acceptTos]
  )

  return (
    <>
      <ModalHeader toggleModal={toggleAuthModal}>Registration</ModalHeader>

      <StyledForm key="sign-up-form" onSubmit={handleSignUp} noValidate>
        <Column gap={26}>
          <Column gap={12}>
            <Input
              id="email"
              value={email}
              placeholder="E-mail"
              type="email"
              onUserInput={onEmailInput}
              $valid={error?.id !== 'email' || loading}
            />
            <Trans
              id="Username"
              render={({ translation }) => (
                <Input
                  id="username"
                  value={username}
                  placeholder={translation}
                  type="text"
                  onUserInput={onUsernameInput}
                  $valid={error?.id !== 'username' || loading}
                />
              )}
            />
            <Trans
              id="Password"
              render={({ translation }) => (
                <Input
                  id="password"
                  value={password}
                  placeholder={translation}
                  type="password"
                  onUserInput={onPasswordInput}
                  autoComplete="new-password"
                  $valid={error?.id !== 'password' || loading}
                />
              )}
            />

            {error.message && (
              <Trans
                id={error.message}
                render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>}
              />
            )}
          </Column>

          <Column gap={12}>
            <Checkbox value={acceptTos} onChange={toggleTosAgreed}>
              <TYPE.body>
                <Trans>
                  I agree to Rules&nbsp;
                  <Link href="/terms-and-conditions" underline>
                    terms and conditions
                  </Link>
                </Trans>
              </TYPE.body>
            </Checkbox>
            <Checkbox value={acceptCommercialEmails} onChange={toggleEmailAgreed}>
              <TYPE.body>
                <Trans>Please send updates about pack releases and new stuff</Trans>
              </TYPE.body>
            </Checkbox>
          </Column>

          <SubmitButton type="submit" large>
            {loading ? 'Loading ...' : 'Submit'}
          </SubmitButton>
        </Column>
      </StyledForm>

      <div style={{ padding: '0 8px' }}>
        <TYPE.subtitle>
          Already have an account?&nbsp;
          <SwitchAuthModeButton onClick={() => setAuthMode(AuthMode.SIGN_IN)}>Connect</SwitchAuthModeButton>
        </TYPE.subtitle>
      </div>
    </>
  )
}
