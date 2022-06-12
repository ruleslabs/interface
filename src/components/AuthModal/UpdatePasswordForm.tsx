import { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ApolloError } from '@apollo/client'
import { Trans, t } from '@lingui/macro'
import { useRouter } from 'next/router'

import { passwordHasher, validatePassword, PasswordError } from '@/utils/password'
import { ModalHeader } from '@/components/Modal'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { usePreparePasswordUpdateQuery, useUpdatePasswordMutation } from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import { PrimaryButton } from '@/components/Button'

const StyledForm = styled.form`
  width: 100%;
`

const SubmitButton = styled(PrimaryButton)`
  height: 55px;
  margin: 12px 0;
`

interface UpdatePasswordFormProps {
  onSuccessfulConnection: (accessToken?: string, onboard?: boolean) => void
}

export default function UpdatePasswordForm({ onSuccessfulConnection }: UpdatePasswordFormProps) {
  // Loading
  const [loading, setLoading] = useState(false)

  // router
  const router = useRouter()
  const { token, email, username } = router.query

  // modal
  const toggleAuthModal = useAuthModalToggle()

  // errors
  const [error, setError] = useState<{ message?: string; id?: string }>({})

  // prepare
  const preparePasswordUpdateQuery = usePreparePasswordUpdateQuery({ variables: { token, email } })
  const readyToUpdate =
    !preparePasswordUpdateQuery.error &&
    !preparePasswordUpdateQuery.data?.preparePasswordUpdate.error &&
    !preparePasswordUpdateQuery.loading

  useEffect(() => {
    if (preparePasswordUpdateQuery.data?.preparePasswordUpdate?.error)
      setError({ message: preparePasswordUpdateQuery.data?.preparePasswordUpdate?.error })
  }, [preparePasswordUpdateQuery.data?.preparePasswordUpdate?.error])

  // graphql mutations
  const [updatePasswordMutation] = useUpdatePasswordMutation()

  // email
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const onPasswordInput = useCallback((password: string) => setPassword(password), [setPassword])
  const onConfirmPasswordInput = useCallback((password: string) => setConfirmPassword(password), [setConfirmPassword])

  // update password
  const handlePasswordUpdate = useCallback(
    async (event) => {
      event.preventDefault()

      if (password !== confirmPassword) {
        setError({ id: 'passwordConfirmation', message: 'Passwords do not match' })
        return
      }

      // Check password
      const passwordError = await validatePassword(email as string, username as string, password)
      if (passwordError !== null) {
        switch (passwordError) {
          case PasswordError.LENGTH:
            setError({ message: 'Password should be at least 6 characters long' })
            break

          case PasswordError.LEVENSHTEIN:
            setError({ message: 'Password too similar to your email or username' })
            break

          case PasswordError.PWNED:
            setError({ message: 'This password appears in a public data breach, please choose a stronger password' })
            break
        }
        return
      }

      setLoading(true)

      const updatePassword = async () => {
        const hashedPassword = await passwordHasher(password)

        updatePasswordMutation({ variables: { email, newPassword: hashedPassword } })
          .then((res: any) => onSuccessfulConnection(res?.data?.updatePassword?.accessToken, false))
          .catch((updatePasswordError: ApolloError) => {
            const error = updatePasswordError?.graphQLErrors?.[0]
            if (error) setError({ message: error.message, id: error.extensions?.id as string })
            else setError({ message: 'Unknown error' })

            setLoading(false)
            console.error(updatePasswordError)
          })
      }
      updatePassword()
    },
    [password, confirmPassword, updatePasswordMutation, setLoading, setError, username]
  )

  return (
    <>
      <ModalHeader onDismiss={toggleAuthModal}>{t`Update password`}</ModalHeader>

      <StyledForm key="update-password" onSubmit={handlePasswordUpdate} noValidate>
        <Column gap={26}>
          <Column gap={12}>
            <input id="email" type="text" value={email} style={{ display: 'none' }} readOnly />

            <Input
              id="password"
              value={password}
              placeholder={t`New password`}
              type="password"
              autoComplete="new-password"
              onUserInput={onPasswordInput}
              $valid={error?.id !== 'password' || loading}
            />

            <Input
              id="password-confirmation"
              value={confirmPassword}
              placeholder={t`Confirm password`}
              type="password"
              autoComplete="new-password"
              onUserInput={onConfirmPasswordInput}
              $valid={error?.id !== 'passwordConfirmation' || loading}
            />

            {error.message && (
              <Trans
                id={error.message}
                render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>}
              />
            )}
          </Column>

          <SubmitButton type="submit" onClick={handlePasswordUpdate} disabled={!readyToUpdate || loading} large>
            {(loading || !readyToUpdate) && !error ? 'Loading ...' : t`Submit`}
          </SubmitButton>
        </Column>
      </StyledForm>
    </>
  )
}
