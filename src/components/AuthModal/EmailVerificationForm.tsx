import { useState, useCallback, useRef, useMemo } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import GoogleReCAPTCHA from 'react-google-recaptcha'

import { ModalHeader } from 'src/components/Modal'
import { ModalBody } from 'src/components/Modal/Classic'
import { EMAIL_VERIFICATION_CODE_LENGTH } from 'src/constants/misc'
import Column from 'src/components/Column'
import Input from 'src/components/Input'
import { TYPE } from 'src/styles/theme'
import { AuthMode } from 'src/state/auth/actions'
import {
  useAuthForm,
  useSetAuthMode,
  useRefreshNewEmailVerificationCodeTime,
  useNewEmailVerificationCodeTime,
} from 'src/state/auth/hooks'
import { useAuthModalToggle } from 'src/state/application/hooks'
import useCountdown from 'src/hooks/useCountdown'
import { passwordHasher } from 'src/utils/password'
import useCreateWallet from 'src/hooks/useCreateWallet'
import { AuthFormProps } from './types'
import { usePrepareSignUp, useSignUp } from 'src/graphql/data/Auth'
import { formatError } from 'src/utils/error'
import { GenieError } from 'src/types'
import ReCAPTCHA, { RecaptchaPolicy } from 'src/components/Recaptcha'

const ResendCode = styled(TYPE.subtitle)`
  display: inline;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
`

interface EmailVerificationFormProps extends AuthFormProps {
  newcomer: boolean
  referentSlug?: string
}

export default function EmailVerificationForm({
  onSuccessfulConnection,
  newcomer,
  referentSlug,
}: EmailVerificationFormProps) {
  // Wallet
  const createWallet = useCreateWallet()

  // form data
  const {
    email,
    username,
    password,
    checkboxes: { acceptCommercialEmails },
  } = useAuthForm()

  // captcha
  const recaptchaRef = useRef<GoogleReCAPTCHA>(null)

  // graphql mutations
  const [signUpMutation, { loading: signUpLoading, error: signUpError }] = useSignUp()
  const [prepareSignUpMutation, { loading: prepareSignUpLoading, error: prepareSignUpError }] = usePrepareSignUp()

  // errors
  const [clientError, setClientError] = useState<GenieError | null>(null)
  const error = clientError ?? prepareSignUpError ?? signUpError

  // loadings
  type Loading = { prepareSignUp?: boolean; signUp?: boolean }
  const [clientLoading, setClientLoading] = useState<Loading>({})
  const loading: Loading = useMemo(
    () => ({
      prepareSignUp: clientLoading.prepareSignUp || prepareSignUpLoading,
      signUp: clientLoading.signUp || signUpLoading,
    }),
    [clientLoading.prepareSignUp, clientLoading.signUp, prepareSignUpLoading, signUpLoading]
  )

  // signUp
  const handleSignUp = useCallback(
    async (code: string) => {
      setClientError(null)

      const hashedPassword = await passwordHasher(password)

      try {
        const { publicKey, address, rulesPrivateKey } = await createWallet(password)
        const { accessToken } = await signUpMutation({
          variables: {
            email,
            username,
            password: hashedPassword,
            walletPublicKey: publicKey,
            walletAddress: address,
            rulesPrivateKey,
            emailVerificationCode: code,
            acceptCommercialEmails,
            newcomer,
            referentSlug,
          },
        })

        if (accessToken) onSuccessfulConnection({ accessToken })
      } catch (error: any) {
        setClientError(formatError(`${error.message}, contact support if the error persist.`))
        return
      }
    },
    [
      password,
      createWallet,
      signUpMutation,
      email,
      username,
      acceptCommercialEmails,
      onSuccessfulConnection,
      newcomer,
      referentSlug,
    ]
  )

  // fields
  const [emailVerificationCode, setEmailVerificationCode] = useState('')
  const onEmailVerificationCodeInput = useCallback(
    (code: string) => {
      if (/^[\d]*$/.test(code) && code.length <= EMAIL_VERIFICATION_CODE_LENGTH) {
        setEmailVerificationCode(code)
        if (code.length === EMAIL_VERIFICATION_CODE_LENGTH) handleSignUp(code)
      }
    },
    [setEmailVerificationCode, handleSignUp]
  )

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // Countdown
  const newEmailVerificationCodeTime = useNewEmailVerificationCodeTime()
  const refreshNewEmailVerificationCodeTime = useRefreshNewEmailVerificationCodeTime()
  const countdown = useCountdown(new Date(newEmailVerificationCodeTime ?? 0))

  // new code
  const handleNewCode = useCallback(async () => {
    setClientLoading((state) => ({ ...state, prepareSignUp: true }))

    // get captcha
    recaptchaRef.current?.reset()
    const recaptchaTokenV2 = await recaptchaRef.current?.executeAsync()
    if (!recaptchaTokenV2) return

    setEmailVerificationCode('')
    setClientLoading((state) => ({ ...state, prepareSignUp: false }))

    const { success } = await prepareSignUpMutation({ variables: { username, email, recaptchaTokenV2 } })

    if (success) refreshNewEmailVerificationCodeTime()
  }, [
    email,
    username,
    prepareSignUpMutation,
    setEmailVerificationCode,
    refreshNewEmailVerificationCodeTime,
    recaptchaRef.current,
  ])

  return (
    <>
      <ModalHeader onDismiss={toggleAuthModal} onBack={() => setAuthMode(AuthMode.SIGN_UP)} />

      <ModalBody>
        <Column gap={26}>
          <TYPE.large>
            <Trans>Enter the code to confirm your registration</Trans>
          </TYPE.large>

          <Column gap={12}>
            <Input
              id="emailVerificationCode"
              value={emailVerificationCode}
              placeholder="Code"
              type="text"
              onUserInput={onEmailVerificationCodeInput}
              loading={loading.signUp}
              $valid={error?.id !== 'emailVerificationCode'}
            />

            {error?.render()}
          </Column>

          <Column gap={8}>
            <TYPE.body>
              {loading.prepareSignUp ? <Trans>Loading...</Trans> : <Trans>The code has been emailed to {email}</Trans>}
            </TYPE.body>
            {countdown?.seconds ? (
              <TYPE.subtitle>
                <Trans>New code in {countdown.seconds} seconds</Trans>
              </TYPE.subtitle>
            ) : (
              <ResendCode onClick={handleNewCode}>
                <Trans>Resend the code</Trans>
              </ResendCode>
            )}
          </Column>

          <RecaptchaPolicy />
          <ReCAPTCHA ref={recaptchaRef} />
        </Column>
      </ModalBody>
    </>
  )
}
