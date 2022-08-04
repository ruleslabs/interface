import { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ApolloError } from '@apollo/client'
import { Trans, t } from '@lingui/macro'

import { ModalHeader } from '@/components/Modal'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { BackButton } from '@/components/Button'
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
  const [requestTwoFactorAuthSecretRemovalMutation] = useRequestTwoFactorAuthSecretRemovalMutation()

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

  // new code
  const handleNewLink = useCallback(
    async (event?: any) => {
      event?.preventDefault()

      setLoading(true)

      requestTwoFactorAuthSecretRemovalMutation({ variables: { email } })
        .then((res: any) => {
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
    [email, requestTwoFactorAuthSecretRemovalMutation, setRecipient, setLoading, setError]
  )

  useEffect(() => {
    handleNewLink()
  }, [])

  return (
    <>
      <ModalHeader onDismiss={toggleAuthModal}>
        <BackButton onClick={() => setAuthMode(AuthMode.TWO_FACTOR_AUTH)} />
      </ModalHeader>

      <Column gap={26}>
        <TYPE.body>
          <Trans>
            You will receive a link to the email address associated to your rules account to remove the Two-Factor
            Authentatication.
          </Trans>
        </TYPE.body>

        {error.message && (
          <Trans id={error.message} render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>} />
        )}

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

          <SubmitButton type="submit" onClick={handleNewLink} disabled={!!countdown?.seconds || loading} large>
            {loading ? 'Loading ...' : t`Submit`}
          </SubmitButton>
        </Column>
      </Column>
    </>
  )
}
