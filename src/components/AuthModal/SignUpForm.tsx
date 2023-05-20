import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'
import GoogleReCAPTCHA from 'react-google-recaptcha'

import { ModalHeader } from '@/components/Modal'
import { ModalContent, ModalBody } from '@/components/Modal/Classic'
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
} from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import Checkbox from '@/components/Checkbox'
import Link from '@/components/Link'
import { validatePassword } from '@/utils/password'
import ReCAPTCHA, { RecaptchaPolicy } from '@/components/Recaptcha'
import { usePrepareSignUp } from '@/graphql/data/Auth'
import { GenieError } from '@/types'
import { formatError } from '@/utils/error'

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
  // graphql
  const [prepareSignUpMutation, { loading: mutationLoading, error: mutationError }] = usePrepareSignUp()

  // errors
  const [clientError, setClientError] = useState<GenieError | null>(null)
  const error = clientError ?? mutationError

  // loading
  const [clientLoading, setClientLoading] = useState(false)
  const loading = clientLoading || mutationLoading

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

  // recaptcha
  const recaptchaRef = useRef<GoogleReCAPTCHA>(null)

  //signup
  const handleSignUp = useCallback(
    async (event) => {
      event.preventDefault()

      // Check tos
      if (!acceptTos) {
        setClientError(formatError('You must accept the terms and conditions'))
        return
      }

      setClientLoading(true)

      // Check password
      const passwordError = await validatePassword(email, username, password)
      if (passwordError !== null) {
        setClientError(formatError(passwordError))
        setClientLoading(false)
        return
      }

      recaptchaRef.current?.reset()
      const recaptchaTokenV2 = await recaptchaRef.current?.executeAsync()
      if (!recaptchaTokenV2) {
        setClientLoading(false)
        return
      }

      setClientLoading(false)

      const { success } = await prepareSignUpMutation({ variables: { username, email, recaptchaTokenV2 } })

      if (success) {
        setAuthMode(AuthMode.EMAIL_VERIFICATION)
        refreshNewEmailVerificationCodeTime()
      }
    },
    [
      email,
      username,
      password,
      prepareSignUpMutation,
      setAuthMode,
      acceptTos,
      recaptchaRef.current,
      refreshNewEmailVerificationCodeTime,
    ]
  )

  return (
    <ModalContent>
      <ModalHeader onDismiss={toggleAuthModal} title={t`Registration`} />

      <ModalBody>
        <StyledForm key="sign-up-form" onSubmit={handleSignUp} noValidate>
          <Column gap={26}>
            <Column gap={12}>
              <Input
                id="email"
                value={email}
                placeholder="E-mail"
                type="email"
                onUserInput={onEmailInput}
                $valid={error?.id !== 'email'}
              />
              <Input
                value={username}
                placeholder={t`Username`}
                type="text"
                onUserInput={onUsernameInput}
                $valid={error?.id !== 'username'}
              />
              <Input
                id="password"
                value={password}
                placeholder={t`Password`}
                type="password"
                onUserInput={onPasswordInput}
                autoComplete="new-password"
                $valid={error?.id !== 'password'}
              />

              <RecaptchaPolicy />

              {error?.render()}
            </Column>

            <Column gap={12}>
              <Checkbox value={acceptTos} onChange={toggleTosAgreed}>
                <TYPE.body>
                  <Trans>
                    I agree to Rules&nbsp;
                    <Link href="/terms" underline>
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

            <Column>
              <ReCAPTCHA ref={recaptchaRef} />

              <SubmitButton type="submit" large>
                {loading ? 'Loading ...' : t`Sign up`}
              </SubmitButton>
            </Column>
          </Column>
        </StyledForm>

        <TYPE.subtitle>
          <Trans>
            Already have an account?&nbsp;
            <SwitchAuthModeButton onClick={() => setAuthMode(AuthMode.SIGN_IN)}>Connect</SwitchAuthModeButton>
          </Trans>
        </TYPE.subtitle>
      </ModalBody>
    </ModalContent>
  )
}
