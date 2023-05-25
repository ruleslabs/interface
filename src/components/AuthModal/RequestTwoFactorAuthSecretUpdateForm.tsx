import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import GoogleReCAPTCHA from 'react-google-recaptcha'

import { ModalHeader } from 'src/components/Modal'
import { ModalBody } from 'src/components/Modal/Classic'
import Column from 'src/components/Column'
import { TYPE } from 'src/styles/theme'
import { AuthMode } from 'src/state/auth/actions'
import {
  useSetAuthMode,
  useAuthForm,
  useNewAuthUpdateLinkTime,
  useRefreshNewAuthUpdateLinkTime,
} from 'src/state/auth/hooks'
import { useAuthModalToggle } from 'src/state/application/hooks'
import useCountdown from 'src/hooks/useCountdown'
import ReCAPTCHA, { RecaptchaPolicy } from '../Recaptcha'
import { useRequestTwoFactorAuthSecretRemoval } from 'src/graphql/data/Auth'

const ResendCode = styled(TYPE.subtitle)`
  display: inline;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
`

export default function RequestPasswordUpdateForm() {
  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // graphql mutations
  const [requestTwoFactorAuthSecretRemovalMutation, { loading: mutationLoading, error }] =
    useRequestTwoFactorAuthSecretRemoval()

  // loading
  const [clientLoading, setClientLoading] = useState(true)
  const loading = clientLoading || mutationLoading

  // email
  const { email } = useAuthForm()

  // Countdown
  const newAuthUpdateLinkTime = useNewAuthUpdateLinkTime()
  const refreshNewAuthUpdateLinkTime = useRefreshNewAuthUpdateLinkTime()
  const countdown = useCountdown(new Date(newAuthUpdateLinkTime ?? 0))

  // recaptcha
  const recaptchaRef = useRef<GoogleReCAPTCHA>(null)

  // new code
  const handleNewLink = useCallback(async () => {
    setClientLoading(true)

    recaptchaRef.current?.reset()
    const recaptchaTokenV2 = await recaptchaRef.current?.executeAsync()
    if (!recaptchaTokenV2) {
      setClientLoading(false)
      return
    }

    setClientLoading(false)

    const { success } = await requestTwoFactorAuthSecretRemovalMutation({ variables: { email, recaptchaTokenV2 } })

    if (success) refreshNewAuthUpdateLinkTime()
  }, [email, requestTwoFactorAuthSecretRemovalMutation, recaptchaRef.current, refreshNewAuthUpdateLinkTime])

  useEffect(() => {
    handleNewLink()
  }, [])

  return (
    <>
      <ModalHeader onDismiss={toggleAuthModal} onBack={() => setAuthMode(AuthMode.TWO_FACTOR_AUTH)} />

      <ModalBody>
        <Column gap={26}>
          {loading ? (
            <TYPE.body>
              <Trans>Loading...</Trans>
            </TYPE.body>
          ) : (
            <>
              {!error && (
                <TYPE.body>
                  <Trans>
                    We sent you a link to the email address associated with your Rules account (<strong>{email}</strong>
                    ) to remove the Two-Factor Authentication.
                  </Trans>
                </TYPE.body>
              )}

              {error?.render()}

              {countdown?.seconds ? (
                <TYPE.subtitle>
                  <Trans>New link available in {countdown.seconds} seconds</Trans>
                </TYPE.subtitle>
              ) : (
                <ResendCode onClick={handleNewLink}>
                  <Trans>Resend the code</Trans>
                </ResendCode>
              )}
            </>
          )}

          <ReCAPTCHA ref={recaptchaRef} />
          <RecaptchaPolicy />
        </Column>
      </ModalBody>
    </>
  )
}
