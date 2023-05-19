import { useState, useCallback, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import GoogleReCAPTCHA from 'react-google-recaptcha'

import { ModalHeader } from '@/components/Modal'
import { ModalContent, ModalBody } from '@/components/Modal/Classic'
import { EMAIL_VERIFICATION_CODE_LENGTH } from '@/constants/misc'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { AuthMode } from '@/state/auth/actions'
import {
  useAuthForm,
  useSetAuthMode,
  useRefreshNewEmailVerificationCodeTime,
  useNewEmailVerificationCodeTime,
} from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import useCountdown from '@/hooks/useCountdown'
import { passwordHasher } from '@/utils/password'
import useCreateWallet from '@/hooks/useCreateWallet'
import { AuthFormProps } from './types'
import { usePrepareSignUp, useSignUp } from '@/graphql/data/Auth'
import { formatError } from '@/utils/error'
import { GenieError } from '@/types'

const ResendCode = styled(TYPE.subtitle)`
  display: inline;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
`

export default function EmailVerificationForm({ onSuccessfulConnection }: AuthFormProps) {
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
  const [signUpMutation, { data: accessToken, ...signUpQuery }] = useSignUp()
  const [prepareSignUpMutation, { data: signUpPrepared, ...prepareSignUpQuery }] = usePrepareSignUp()

  // errors
  const [clientError, setClientError] = useState<GenieError | null>(null)
  const error = clientError ?? prepareSignUpQuery.error ?? signUpQuery.error

  // signUp
  const handleSignUp = useCallback(
    async (code: string) => {
      const hashedPassword = await passwordHasher(password)

      try {
        const { starkPub: starknetPub, userKey: rulesPrivateKey } = await createWallet(password)
        signUpMutation({
          variables: {
            email,
            username,
            password: hashedPassword,
            starknetPub,
            rulesPrivateKey,
            emailVerificationCode: code,
            acceptCommercialEmails,
          },
        })
      } catch (error: any) {
        setClientError(formatError(`${error.message}, contact support if the error persist.`))
        return
      }
    },
    [email, username, password, signUpMutation, createWallet]
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
  const handleNewCode = useCallback(
    async (event) => {
      event.preventDefault()

      // get captcha
      recaptchaRef.current?.reset()
      const recaptchaTokenV2 = await recaptchaRef.current?.executeAsync()
      if (!recaptchaTokenV2) return

      setEmailVerificationCode('')

      prepareSignUpMutation({ variables: { username, email, recaptchaTokenV2 }})
    },
    [email, username, prepareSignUpMutation, setEmailVerificationCode]
  )

  useEffect(() => {
    if (signUpPrepared) refreshNewEmailVerificationCodeTime()
  }, [signUpPrepared, refreshNewEmailVerificationCodeTime])

  useEffect(() => {
    if (accessToken) onSuccessfulConnection({ accessToken })
  }, [accessToken, onSuccessfulConnection])

  return (
    <ModalContent>
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
              loading={signUpQuery.loading}
              $valid={error?.id !== 'emailVerificationCode'}
            />

            {error?.render()}
          </Column>

          <Column gap={8}>
            <TYPE.body>
              <Trans>The code has been emailed to {email}</Trans>
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
        </Column>
      </ModalBody>
    </ModalContent>
  )
}
