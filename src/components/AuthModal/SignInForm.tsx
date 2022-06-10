import { useCallback, useState } from 'react'
import styled from 'styled-components'
import GoogleLogin from 'react-google-login'
import { ApolloError } from '@apollo/client'
import { Trans, t } from '@lingui/macro'

import { ModalHeader } from '@/components/Modal'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { PrimaryButton, CustomGoogleLogin } from '@/components/Button'
import { AuthMode } from '@/state/auth/actions'
import {
  useAuthForm,
  useAuthActionHanlders,
  useSetAuthMode,
  useSignInMutation,
  useGoogleAuthMutation,
} from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import Separator from '@/components/Separator'
import { passwordHasher } from '@/utils/password'

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

interface SignInFormProps {
  onSuccessfulConnection: (accessToken?: string, onboard?: boolean) => void
}

export default function SignInForm({ onSuccessfulConnection }: SignInFormProps) {
  // Loading
  const [loading, setLoading] = useState(false)

  // graphql
  const [signInMutation] = useSignInMutation()
  const [googleAuthMutation] = useGoogleAuthMutation()

  // fields
  const { email, password } = useAuthForm()
  const { onEmailInput, onPasswordInput } = useAuthActionHanlders()

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // google oauth
  const handleGoogleLogin = useCallback(
    async (googleData) => {
      if (googleData.tokenId) {
        googleAuthMutation({ variables: { token: googleData.tokenId } })
          .then((res: any) => onSuccessfulConnection(res?.data?.googleAuth?.accessToken))
          .catch((googleAuthError: ApolloError) => {
            const error = googleAuthError?.graphQLErrors?.[0]
            if (error) setError({ message: error.message, id: error.extensions?.id as string })
            else if (!loading) setError({})

            console.error(googleAuthError)
          })
      }
    },
    [googleAuthMutation, onSuccessfulConnection, setLoading]
  )

  // errors
  const [error, setError] = useState<{ message?: string; id?: string }>({})

  // signin
  const handleSignIn = useCallback(
    async (event) => {
      event.preventDefault()

      const hashedPassword = await passwordHasher(password)

      setLoading(true)

      signInMutation({ variables: { email, password: hashedPassword } })
        .then((res: any) => onSuccessfulConnection(res?.data?.signIn?.accessToken))
        .catch((signInError: ApolloError) => {
          const error = signInError?.graphQLErrors?.[0]
          if (error) setError({ message: error.message, id: error.extensions?.id as string })
          else if (!loading) setError({})

          console.error(signInError)
          setLoading(false)
        })
    },
    [email, password, signInMutation, onSuccessfulConnection, setLoading]
  )

  return (
    <>
      <ModalHeader onDismiss={toggleAuthModal}>{t`Connection`}</ModalHeader>

      <StyledForm key="sign-in-form" onSubmit={handleSignIn} noValidate>
        <Column gap={20}>
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <>
              <GoogleLogin
                render={(renderProps) => <CustomGoogleLogin {...renderProps} />}
                clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
                onSuccess={handleGoogleLogin}
                onFailure={handleGoogleLogin}
                cookiePolicy={'single_host_origin'}
              />
              <Separator>
                <Trans>or</Trans>
              </Separator>
            </>
          )}

          <Column gap={12}>
            <Input
              id="email"
              value={email}
              placeholder="E-mail"
              type="email"
              autoComplete="email"
              onUserInput={onEmailInput}
              $valid={error?.id !== 'email' || loading}
            />
            <Input
              id="password"
              value={password}
              placeholder={t`Password`}
              type="password"
              autoComplete="current-password"
              onUserInput={onPasswordInput}
              $valid={error?.id !== 'password' || loading}
            />

            {error.message && (
              <Trans
                id={error.message}
                render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>}
              />
            )}
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
    </>
  )
}
