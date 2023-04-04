import { useState, useCallback, useRef } from 'react'
import styled from 'styled-components'
import { ApolloError } from '@apollo/client'
import { Trans, t } from '@lingui/macro'
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
  useRequestPasswordUpdateMutation,
  useNewAuthUpdateLinkTime,
  useRefreshNewAuthUpdateLinkTime,
} from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import useCountdown from '@/hooks/useCountdown'
import { PrimaryButton } from '@/components/Button'
import ReCAPTCHA, { RecaptchaPolicy } from '@/components/Recaptcha'

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
  const [requestPasswordUpdateMutation] = useRequestPasswordUpdateMutation()

  // email
  const { email: emailFromState } = useAuthForm()
  const [email, setEmail] = useState(emailFromState)
  const [recipient, setRecipient] = useState<string | null>(null)
  const onEmailInput = useCallback((email: string) => setEmail(email), [setEmail])

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
    async (event) => {
      event.preventDefault()

      setLoading(true)

      recaptchaRef.current?.reset()
      const recaptchaTokenV2 = await recaptchaRef.current?.executeAsync()

      requestPasswordUpdateMutation({ variables: { email, recaptchaTokenV2 } })
        .then(() => {
          setLoading(false)
          refreshNewAuthUpdateLinkTime()
          setRecipient(email)
          setError({})
        })
        .catch((prepareSignUpError: ApolloError) => {
          const error = prepareSignUpError?.graphQLErrors?.[0]
          if (error) setError({ message: error.message, id: error.extensions?.id as string })
          else setError({ message: 'Unknown error' })

          console.error(prepareSignUpError)
          setLoading(false)
          setRecipient(null)
        })
    },
    [email, requestPasswordUpdateMutation, recaptchaRef.current]
  )

  return (
    <ModalContent>
      <ModalHeader onDismiss={toggleAuthModal} onBack={() => setAuthMode(AuthMode.SIGN_IN)} />

      <ModalBody>
        <Column gap={26}>
          <TYPE.body>
            <Trans>
              Enter your email to request a password update, you will receive a link to that email address to update
              your password.
            </Trans>
          </TYPE.body>

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

            <RecaptchaPolicy />

            {error.message && (
              <Trans
                id={error.message}
                render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>}
              />
            )}
          </Column>

          <Column gap={8}>
            {recipient && (
              <TYPE.body>
                <Trans>The link has been emailed to {recipient}</Trans>
              </TYPE.body>
            )}

            {!!countdown?.seconds && (
              <TYPE.subtitle>
                <Trans>New link available in {countdown.seconds} seconds</Trans>
              </TYPE.subtitle>
            )}

            <Column>
              <ReCAPTCHA ref={recaptchaRef} />

              <SubmitButton type="submit" onClick={handleNewLink} disabled={!!countdown?.seconds} large>
                {loading ? 'Loading ...' : t`Send`}
              </SubmitButton>
            </Column>
          </Column>
        </Column>
      </ModalBody>
    </ModalContent>
  )
}
