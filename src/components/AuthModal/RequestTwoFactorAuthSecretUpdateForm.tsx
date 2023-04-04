import { useState, useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ApolloError } from '@apollo/client'
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
  useRequestTwoFactorAuthSecretRemovalMutation,
  useNewAuthUpdateLinkTime,
  useRefreshNewAuthUpdateLinkTime,
} from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import useCountdown from '@/hooks/useCountdown'
import { PrimaryButton } from '@/components/Button'
import ReCAPTCHA, { RecaptchaPolicy } from '../Recaptcha'

const SubmitButton = styled(PrimaryButton)`
  height: 55px;
  margin: 12px 0;
`

export default function RequestPasswordUpdateForm() {
  // Loading
  const [loading, setLoading] = useState(false)

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // graphql mutations
  const [requestTwoFactorAuthSecretRemovalMutation] = useRequestTwoFactorAuthSecretRemovalMutation()

  // email
  const { email: emailFromState } = useAuthForm()
  const [email, setEmail] = useState(emailFromState)

  // Countdown
  const newAuthUpdateLinkTime = useNewAuthUpdateLinkTime()
  const refreshNewAuthUpdateLinkTime = useRefreshNewAuthUpdateLinkTime()
  const countdown = useCountdown(new Date(newAuthUpdateLinkTime ?? 0))

  // errors
  const [error, setError] = useState<{ message?: string; id?: string }>({})

  // recaptcha
  const recaptchaRef = useRef<GoogleReCAPTCHA>(null)

  // new code
  const handleNewLink = useCallback(
    async (event?: any) => {
      event?.preventDefault()

      setLoading(true)

      recaptchaRef.current?.reset()
      const recaptchaTokenV2 = await recaptchaRef.current?.executeAsync()

      requestTwoFactorAuthSecretRemovalMutation({ variables: { email, recaptchaTokenV2 } })
        .then(() => {
          setLoading(false)
          refreshNewAuthUpdateLinkTime()
          setError({})
        })
        .catch((prepareSignUpError: ApolloError) => {
          const error = prepareSignUpError?.graphQLErrors?.[0]
          if (error) setError({ message: error.message, id: error.extensions?.id as string })
          else setError({ message: 'Unknown error' })

          console.error(prepareSignUpError)
          setLoading(false)
        })
    },
    [email, requestTwoFactorAuthSecretRemovalMutation, recaptchaRef.current]
  )

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

          {error.message && (
            <TYPE.body color="error">
              <Trans id={error.message} render={({ translation }) => <>{translation}</>} />
            </TYPE.body>
          )}

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
