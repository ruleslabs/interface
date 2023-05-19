import { useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'
import GoogleReCAPTCHA from 'react-google-recaptcha'

import { ModalHeader } from '@/components/Modal'
import { ModalContent, ModalBody } from '@/components/Modal/Classic'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { AuthMode } from '@/state/auth/actions'
import {
  useSetAuthMode,
  useAuthForm,
  useNewAuthUpdateLinkTime,
  useRefreshNewAuthUpdateLinkTime,
} from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import useCountdown from '@/hooks/useCountdown'
import { PrimaryButton } from '@/components/Button'
import ReCAPTCHA, { RecaptchaPolicy } from '../Recaptcha'
import { useRequestTwoFactorAuthSecretRemoval } from '@/graphql/data/Auth'

const SubmitButton = styled(PrimaryButton)`
  height: 55px;
  margin: 12px 0;
`

export default function RequestPasswordUpdateForm() {
  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // graphql mutations
  const [
    requestTwoFactorAuthSecretRemovalMutation,
    { data: requested, loading, error },
  ] = useRequestTwoFactorAuthSecretRemoval()

  // email
  const { email } = useAuthForm()

  // Countdown
  const newAuthUpdateLinkTime = useNewAuthUpdateLinkTime()
  const refreshNewAuthUpdateLinkTime = useRefreshNewAuthUpdateLinkTime()
  const countdown = useCountdown(new Date(newAuthUpdateLinkTime ?? 0))

  // recaptcha
  const recaptchaRef = useRef<GoogleReCAPTCHA>(null)

  // new code
  const handleNewLink = useCallback(
    async (event?: any) => {
      event?.preventDefault()

      recaptchaRef.current?.reset()
      const recaptchaTokenV2 = await recaptchaRef.current?.executeAsync()
      if (!recaptchaTokenV2) return

      requestTwoFactorAuthSecretRemovalMutation({ variables: { email, recaptchaTokenV2 } })
    },
    [email, requestTwoFactorAuthSecretRemovalMutation, recaptchaRef.current]
  )

  useEffect(() => {
    if (requested) refreshNewAuthUpdateLinkTime()
  }, [requested, refreshNewAuthUpdateLinkTime])

  useEffect(() => {
    handleNewLink()
  }, [])

  return (
    <ModalContent>
      <ModalHeader onDismiss={toggleAuthModal} onBack={() => setAuthMode(AuthMode.TWO_FACTOR_AUTH)} />

      <ModalBody>
        <Column gap={26}>
          <TYPE.body>
            <Trans>
              We sent you a link to the email address associated with your Rules account (<strong>{email}</strong>) to
              remove the Two-Factor Authentication.
            </Trans>
          </TYPE.body>

          <RecaptchaPolicy />

          {error?.render()}

          <Column gap={8}>
            {!!countdown?.seconds && (
              <TYPE.subtitle>
                <Trans>New link available in {countdown.seconds} seconds</Trans>
              </TYPE.subtitle>
            )}

            <Column>
              <ReCAPTCHA ref={recaptchaRef} />

              <SubmitButton type="submit" onClick={handleNewLink} disabled={!!countdown?.seconds || loading} large>
                {loading ? 'Loading ...' : t`Send`}
              </SubmitButton>
            </Column>
          </Column>
        </Column>
      </ModalBody>
    </ModalContent>
  )
}
