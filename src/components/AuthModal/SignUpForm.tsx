import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { RowCenter } from '@/components/Row'
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
import { validatePassword, passwordHasher, PasswordError } from '@/utils/password'

import Close from '@/images/close.svg'

const StyledClose = styled(Close)`
  width: 20px;
  height: 20px;
  cursor: pointer;
`

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

  // checkboxes
  const [tosAgreed, setTosAgreed] = useState(false)
  const [emailsAgreed, setEmailsAgreed] = useState(false)
  const toggleTosAgreed = useCallback(() => setTosAgreed(!tosAgreed), [tosAgreed])
  const toggleEmailAgreed = useCallback(() => setEmailsAgreed(!emailsAgreed), [emailsAgreed])

  // fields
  const { email, password, username } = useAuthForm()
  const { onEmailInput, onPasswordInput, onUsernameInput } = useAuthActionHanlders()

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
      if (!tosAgreed) {
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
        .catch((prepareSignUpError: Error) => {
          const error = prepareSignUpError?.graphQLErrors?.[0]
          if (error) setError({ message: error.message, id: error.extensions?.id })
          else if (!loading) setError({})

          console.error(prepareSignUpError)
          setLoading(false)
        })
    },
    [email, username, password, prepareSignUpMutation, setAuthMode, tosAgreed]
  )

  return (
    <>
      <RowCenter justify="space-between" style={{ padding: '0 8px' }}>
        <TYPE.large>Registration</TYPE.large>
        <StyledClose onClick={toggleAuthModal} />
      </RowCenter>

      <StyledForm key="sign-up-form" onSubmit={handleSignUp} novalidate>
        <Column gap={26}>
          <Column gap={12}>
            <Input
              id="email"
              value={email}
              placeholder="E-mail"
              type="text"
              onUserInput={onEmailInput}
              $valid={error?.id !== 'email' || loading}
            />
            <Input
              id="username"
              value={username}
              placeholder="Username"
              type="text"
              onUserInput={onUsernameInput}
              $valid={error?.id !== 'username' || loading}
            />
            <Input
              id="password"
              value={password}
              placeholder="Password"
              type="password"
              onUserInput={onPasswordInput}
              autoComplete="new-password"
              $valid={error?.id !== 'password' || loading}
            />
            <TYPE.body color="error">{error.message}</TYPE.body>
          </Column>

          <Column gap={12}>
            <Checkbox value={tosAgreed} onChange={toggleTosAgreed}>
              <TYPE.body>
                I agree to Rules&nbsp;
                <Link href="/terms-and-conditions">terms and conditions</Link>
              </TYPE.body>
            </Checkbox>
            <Checkbox value={emailsAgreed} onChange={toggleEmailAgreed}>
              <TYPE.body>I want to receive emails about packs and stuff</TYPE.body>
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
