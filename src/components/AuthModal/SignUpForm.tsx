import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useMutation, gql } from '@apollo/client'

import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import { AuthMode } from '@/state/auth/actions'
import { useAuthForm, useAuthActionHanlders, useSetAuthMode } from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import Checkbox from '@/components/Checkbox'
import Link from '@/components/Link'

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

const PREPARE_SIGN_UP_MUTATION = gql`
  mutation ($email: String!, $username: String!) {
    prepareSignUp(input: { email: $email, username: $username })
  }
`

const SubmitButton = styled(PrimaryButton)`
  height: 55px;
  margin: 12px 0;
`

export default function SignUpForm() {
  // Loading
  const [loading, setLoading] = useState(false)

  // graphql
  const [prepareSignUpMutation, prepareSignUpResult] = useMutation(PREPARE_SIGN_UP_MUTATION)

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

  //signup
  const handleSignUp = useCallback(
    async (event) => {
      event.preventDefault()

      setLoading(true)

      prepareSignUpMutation({ variables: { username, email } })
        .then((res: any) => {
          if (!res?.data?.prepareSignUp?.error) setAuthMode(AuthMode.EMAIL_VERIFICATION)
          else setLoading(false)
        })
        .catch((err: Error) => {
          console.error(err)
          setLoading(false)
        })
    },
    [email, username, prepareSignUpMutation, setAuthMode]
  )

  // errors
  const [error, setError] = useState<{ message?: string; id?: string }>({})

  useEffect(() => {
    const error = prepareSignUpResult?.error?.graphQLErrors?.[0]
    if (error) setError({ message: error.message, id: error.extensions?.id })
    else if (!loading) setError({})
  }, [prepareSignUpResult.error, setError])

  // reset form errors if modal is unmounted
  useEffect(() => {
    return () => prepareSignUpResult?.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
              $valid={error?.id !== 'email'}
            />
            <Input
              id="username"
              value={username}
              placeholder="Username"
              type="text"
              onUserInput={onUsernameInput}
              $valid={error?.id !== 'username'}
            />
            <Input
              id="password"
              value={password}
              placeholder="Password"
              type="password"
              onUserInput={onPasswordInput}
              autoComplete="new-password"
              $valid={error?.id !== 'password'}
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
