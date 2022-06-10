import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { ApolloError } from '@apollo/client'
import { Trans, t } from '@lingui/macro'

import { ModalHeader } from '@/components/Modal'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { BackButton } from '@/components/Button'
import { AuthMode } from '@/state/auth/actions'
import {
  useSetAuthMode,
  useAuthForm,
  useRequestPasswordUpdateMutation,
  useNewEmailVerificationCodeTime,
  useRefreshNewEmailVerificationCodeTime,
} from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import useCountdown from '@/hooks/useCountdown'
import { PrimaryButton } from '@/components/Button'

const ResendLink = styled(TYPE.subtitle)`
  display: inline;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
`

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
  const [recipient, setRecipient] = useState(null)
  const onEmailInput = useCallback((email: string) => setEmail(email), [setEmail])

  // Countdown
  const newEmailVerificationCodeTime = useNewEmailVerificationCodeTime()
  const refreshNewEmailVerificationCodeTime = useRefreshNewEmailVerificationCodeTime()
  const countdown = useCountdown(new Date(newEmailVerificationCodeTime ?? 0))

  // errors
  const [error, setError] = useState<{ message?: string; id?: string }>({})

  // new code
  const handleNewLink = useCallback(
    async (event) => {
      event.preventDefault()

      setLoading(true)

      requestPasswordUpdateMutation({ variables: { email } })
        .then((res: any) => {
          setLoading(false)
          refreshNewEmailVerificationCodeTime()
          setRecipient(email)
          setError({})
        })
        .catch((prepareSignUpError: ApolloError) => {
          const error = prepareSignUpError?.graphQLErrors?.[0]
          if (error) setError({ message: error.message, id: error.extensions?.id as string })
          else if (!loading) setError({})

          console.error(prepareSignUpError)
          setLoading(false)
          setRecipient(null)
        })
    },
    [email, requestPasswordUpdateMutation, setRecipient]
  )

  return (
    <>
      <ModalHeader onDismiss={toggleAuthModal}>
        <BackButton onClick={() => setAuthMode(AuthMode.SIGN_IN)} />
      </ModalHeader>

      <Column gap={26}>
        <TYPE.body>
          <Trans>
            Enter your email to request a password update, you will receive a link to that email address to update your
            password.
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
              <Trans>New link in {countdown.seconds} seconds</Trans>
            </TYPE.subtitle>
          )}

          <SubmitButton type="submit" onClick={handleNewLink} disabled={!!countdown?.seconds} large>
            {loading ? 'Loading ...' : t`Submit`}
          </SubmitButton>
        </Column>
      </Column>
    </>
  )
}
