import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import GoogleReCAPTCHA from 'react-google-recaptcha'

import { ModalHeader } from '@/components/Modal'
import { ModalContent, ModalBody } from '@/components/Modal/Classic'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { AuthMode } from '@/state/auth/actions'
import {
  useSetAuthMode,
  useAuthForm,
  useNewAuthUpdateLinkTime,
  useRefreshNewAuthUpdateLinkTime,
  useAuthActionHanlders,
} from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import useCountdown from '@/hooks/useCountdown'
import { PrimaryButton } from '@/components/Button'
import ReCAPTCHA, { RecaptchaPolicy } from '@/components/Recaptcha'
import { useRequestPasswordUpdate } from '@/graphql/data/Auth'

const SubmitButton = styled(PrimaryButton)`
  height: 55px;
  margin: 12px 0;
`

export default function RequestPasswordUpdateForm() {
  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // graphql mutations
  const [requestPasswordUpdateMutation, { loading: mutationLoading, error }] = useRequestPasswordUpdate()

  // loading
  const [clientLoading, setClientLoading] = useState(false)
  const loading = clientLoading || mutationLoading

  // email
  const { email } = useAuthForm()
  const { onEmailInput } = useAuthActionHanlders()

  // success
  const [success, setSuccess] = useState(false)

  // Countdown
  const newAuthUpdateLinkTime = useNewAuthUpdateLinkTime()
  const refreshNewAuthUpdateLinkTime = useRefreshNewAuthUpdateLinkTime()
  const countdown = useCountdown(new Date(newAuthUpdateLinkTime ?? 0))

  // recaptcha
  const recaptchaRef = useRef<GoogleReCAPTCHA>(null)

  // new code
  const handleNewLink = useCallback(async () => {
    setSuccess(false)
    setClientLoading(true)

    recaptchaRef.current?.reset()
    const recaptchaTokenV2 = await recaptchaRef.current?.executeAsync()

    setClientLoading(false)

    if (!recaptchaTokenV2) return

    const { success } = await requestPasswordUpdateMutation({ variables: { email, recaptchaTokenV2 } })

    if (success) {
      setSuccess(true)
      refreshNewAuthUpdateLinkTime()
    }
  }, [email, requestPasswordUpdateMutation, refreshNewAuthUpdateLinkTime, recaptchaRef.current])

  return (
    <ModalContent>
      <ModalHeader onDismiss={toggleAuthModal} onBack={() => setAuthMode(AuthMode.SIGN_IN)} />

      <ModalBody>
        <Column gap={26}>
          <TYPE.body>
            {success ? (
              <Trans>The link has been emailed to {email}</Trans>
            ) : loading ? (
              <Trans>Loading...</Trans>
            ) : (
              <Trans>
                Enter your email to request a password update, you will receive a link to that email address to update
                your password.
              </Trans>
            )}
          </TYPE.body>

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

            {error?.render()}
          </Column>

          <Column gap={8}>
            <SubmitButton type="submit" onClick={handleNewLink} disabled={!!countdown?.seconds || loading} large>
              <Trans>Send</Trans>
            </SubmitButton>

            {!!countdown?.seconds && (
              <TYPE.subtitle>
                <Trans>New link in {countdown.seconds} seconds</Trans>
              </TYPE.subtitle>
            )}

            <ReCAPTCHA ref={recaptchaRef} />
            <RecaptchaPolicy />
          </Column>
        </Column>
      </ModalBody>
    </ModalContent>
  )
}
