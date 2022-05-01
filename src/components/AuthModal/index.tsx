import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useMutation, gql } from '@apollo/client'
import GoogleLogin from 'react-google-login'

import Modal from '@/components/Modal'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import { useModalOpen, useAuthModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { PrimaryButton, CustomGoogleLogin } from '@/components/Button'
import { TYPE } from '@/styles/theme'
import Input from '@/components/Input'
import Checkbox from '@/components/Checkbox'
import Link from '@/components/Link'
import { useAuthForm, useAuthActionHanlders, useSetAuthMode, useAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import { storeAccessToken } from '@/utils/accessToken'
import useCreateWallet from '@/hooks/useCreateWallet'
import { useQueryCurrentUser } from '@/state/user/hooks'
import Separator from '@/components/Separator'

import Close from '@/images/close.svg'

const StyledClose = styled(Close)`
  width: 20px;
  height: 20px;
  cursor: pointer;
`

const StyledAuthModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;
`

const StyledForm = styled.form`
  width: 100%;
`

const SubmitButton = styled(PrimaryButton)`
  height: 55px;
  margin: 12px 0;
`

const SwitchAuthModeButton = styled(TYPE.subtitle)`
  display: inline;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
`

const SIGN_IN_MUTATION = gql`
  mutation ($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      accessToken
    }
  }
`

const SIGN_UP_MUTATION = gql`
  mutation (
    $email: String!
    $username: String!
    $password: String!
    $starknetAddress: String!
    $rulesPrivateKey: RulesPrivateKeyAttributes!
    $rulesPrivateKeyBackup: String!
  ) {
    signUp(
      input: {
        email: $email
        username: $username
        password: $password
        starknetAddress: $starknetAddress
        rulesPrivateKey: $rulesPrivateKey
        rulesPrivateKeyBackup: $rulesPrivateKeyBackup
      }
    ) {
      accessToken
    }
  }
`

const AUTH_GOOGLE_MUTATION = gql`
  mutation ($token: String!) {
    authGoogle(token: $token) {
      accessToken
      user {
        id
        login
      }
    }
  }
`

export default function AuthModal() {
  // Wallet
  const createWallet = useCreateWallet()

  // Loading
  const [loading, setLoading] = useState(false)

  // graphql mutations
  const [signInMutation, { data: signInData, error: signInError, reset: signInMutationReset }] =
    useMutation(SIGN_IN_MUTATION)
  const [signUpMutation, { data: signUpData, error: signUpError, reset: signUpMutationReset }] =
    useMutation(SIGN_UP_MUTATION)
  const [authGoogleMutation, { data: authGoogleData, error: authGoogleError, reset: authGoogleMutationReset }] =
    useMutation(AUTH_GOOGLE_MUTATION)

  // checkboxes
  const [tosAgreed, setTosAgreed] = useState(false)
  const [emailsAgreed, setEmailsAgreed] = useState(false)

  const toggleTosAgreed = useCallback(() => setTosAgreed(!tosAgreed), [tosAgreed])
  const toggleEmailAgreed = useCallback(() => setEmailsAgreed(!emailsAgreed), [emailsAgreed])

  // fields
  const { email, password, username } = useAuthForm()
  const { onEmailInput, onPasswordInput, onUsernameInput } = useAuthActionHanlders()

  // modal
  const isOpen = useModalOpen(ApplicationModal.AUTH)
  const toggleAuthModal = useAuthModalToggle()

  const authMode = useAuthMode()
  const setAuthMode = useSetAuthMode()

  // Current user
  const queryCurrentUser = useQueryCurrentUser()
  const onSuccessfulConnexion = useCallback(
    async (accessToken?: string) => {
      storeAccessToken(accessToken ?? '')
      const currentUser = await queryCurrentUser()

      if (!!currentUser) toggleAuthModal()
      else window.location.reload()
    },
    [queryCurrentUser, toggleAuthModal]
  )

  // google oauth
  const handleGoogleLogin = useCallback(async (googleData) => {
    if (googleData.tokenId) {
      authGoogleMutation({ variables: { token: googleData.tokenId } })
        .then((res: any) => onSuccessfulConnexion(res?.data?.authGoogle?.accessToken))
        .catch((err: Error) => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [])

  // signin
  const handleSignIn = useCallback(
    (event) => {
      event.preventDefault()

      setLoading(true)

      signInMutation({ variables: { email, password } })
        .then((res: any) => onSuccessfulConnexion(res?.data?.signIn?.accessToken))
        .catch((err: Error) => {
          console.error(err)
          setLoading(false)
        })
    },
    [email, password, signInMutation]
  )

  //signup
  const handleSignUp = useCallback(
    async (event) => {
      event.preventDefault()

      setLoading(true)

      const walletInfos = await createWallet(password)
      if (!walletInfos) return

      const { starknetAddress, userKey: rulesPrivateKey, backupKey: rulesPrivateKeyBackup } = walletInfos

      signUpMutation({
        variables: { email, username, password, starknetAddress, rulesPrivateKey, rulesPrivateKeyBackup },
      })
        .then((res: any) => onSuccessfulConnexion(res?.data?.signUp?.accessToken))
        .catch((err: Error) => {
          console.error(err)
          setLoading(false)
        })
    },
    [email, username, password, signUpMutation, createWallet]
  )

  // errors
  const [formErrors, setFormErrors] = useState<{
    signInEmail?: string
    signInPassword?: string
    signUpEmail?: string
    signUpUsername?: string
    signUpPassword?: string
  }>({})

  useEffect(() => {
    if (signInError) {
      signInError?.graphQLErrors?.map((error) => {
        setFormErrors({
          signInPassword: error.extensions.password as string,
          signInEmail: error.extensions.email as string,
        })
      })
    } else {
      setFormErrors({
        ...formErrors,
        signInPassword: undefined,
        signInEmail: undefined,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signInError])

  useEffect(() => {
    if (signUpError) {
      signUpError?.graphQLErrors?.map((error) => {
        setFormErrors({
          signUpPassword: error.extensions.password as string,
          signUpUsername: error.extensions.password as string,
          signUpEmail: error.extensions.email as string,
        })
      })
    } else {
      setFormErrors({
        ...formErrors,
        signUpPassword: undefined,
        signUpUsername: undefined,
        signUpEmail: undefined,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signUpError])

  // reset form errors if modal is updated
  useEffect(() => {
    signInMutationReset()
    signUpMutationReset()
    authGoogleMutationReset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMode, isOpen])

  const SignInForm = () => {
    return (
      <StyledForm key="sign-in-form" onSubmit={handleSignIn}>
        <Column gap={20}>
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <>
              <GoogleLogin
                render={(renderProps) => <CustomGoogleLogin {...renderProps} />}
                clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
                buttonText="Log in with Google"
                onSuccess={handleGoogleLogin}
                onFailure={handleGoogleLogin}
                cookiePolicy={'single_host_origin'}
              />
              <Separator>or</Separator>
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
              error={formErrors.signInEmail}
            />
            <Input
              id="password"
              value={password}
              placeholder="Password"
              type="password"
              autoComplete="password"
              onUserInput={onPasswordInput}
              error={formErrors.signInPassword}
            />
          </Column>

          <Column gap={12}>
            <SubmitButton type="submit" large>
              {loading ? 'Loading ...' : 'Submit'}
            </SubmitButton>
          </Column>
        </Column>
      </StyledForm>
    )
  }

  const SignUpForm = () => {
    return (
      <StyledForm key="sign-up-form" onSubmit={handleSignUp}>
        <Column gap={26}>
          <Column gap={12}>
            <Input
              id="email"
              value={email}
              placeholder="E-mail"
              type="text"
              onUserInput={onEmailInput}
              error={formErrors.signUpEmail}
            />
            <Input
              id="username"
              value={username}
              placeholder="Username"
              type="text"
              onUserInput={onUsernameInput}
              error={formErrors.signUpUsername}
            />
            <Input
              id="password"
              value={password}
              placeholder="Password"
              type="password"
              onUserInput={onPasswordInput}
              autoComplete="new-password"
              error={formErrors.signUpPassword}
            />
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
    )
  }

  return (
    <Modal onDismiss={toggleAuthModal} isOpen={isOpen}>
      <StyledAuthModal gap={26}>
        <RowCenter justify="space-between" style={{ padding: '0 8px' }}>
          <TYPE.large>{authMode === AuthMode.SIGN_IN ? 'Connection' : 'Registration'}</TYPE.large>
          <StyledClose onClick={toggleAuthModal} />
        </RowCenter>

        {authMode === AuthMode.SIGN_IN ? SignInForm() : SignUpForm()}

        <Column gap={12} style={{ padding: '0 8px' }}>
          {authMode === AuthMode.SIGN_IN && <TYPE.subtitle clickable>Forgot your password?</TYPE.subtitle>}
          <TYPE.subtitle>
            {authMode === AuthMode.SIGN_IN ? 'No account? ' : 'Already have an account? '}
            <SwitchAuthModeButton
              onClick={() => setAuthMode(authMode === AuthMode.SIGN_IN ? AuthMode.SIGN_UP : AuthMode.SIGN_IN)}
            >
              {authMode === AuthMode.SIGN_IN ? 'Join Rules' : 'Connect'}
            </SwitchAuthModeButton>
          </TYPE.subtitle>
        </Column>
      </StyledAuthModal>
    </Modal>
  )
}
