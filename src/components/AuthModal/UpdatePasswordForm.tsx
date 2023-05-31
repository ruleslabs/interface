import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { t } from '@lingui/macro'
import { redirect } from 'react-router-dom'

import { ModalHeader } from 'src/components/Modal'
import { ModalBody } from 'src/components/Modal/Classic'
import { passwordHasher, validatePassword } from 'src/utils/password'
import Column from 'src/components/Column'
import Input from 'src/components/Input'
import { useAuthModalToggle } from 'src/state/application/hooks'
import { PrimaryButton } from 'src/components/Button'
import useCreateWallet from 'src/hooks/useCreateWallet'
import { AuthFormProps } from './types'
import { useUpdatePassword } from 'src/graphql/data/Auth'
import { GenieError } from 'src/types'
import { formatError } from 'src/utils/error'
import useLocationQuery from 'src/hooks/useLocationQuery'

const StyledForm = styled.form`
  width: 100%;
`

const SubmitButton = styled(PrimaryButton)`
  height: 55px;
  margin: 12px 0;
`

export default function UpdatePasswordForm({ onSuccessfulConnection }: AuthFormProps) {
  // Wallet
  const createWallet = useCreateWallet()

  // router
  const query = useLocationQuery()
  const token = query.get('token')
  const username = query.get('username')
  const encodedEmail = query.get('email')
  const email = useMemo(() => (encodedEmail ? decodeURIComponent(encodedEmail as string) : undefined), [encodedEmail])

  // modal
  const toggleAuthModal = useAuthModalToggle()

  // graphql mutations
  const [updatePasswordMutation, { loading, error: mutationError }] = useUpdatePassword()

  // errors
  const [clientError, setClientError] = useState<GenieError | null>(null)
  const error = clientError ?? mutationError

  // email
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const onPasswordInput = useCallback((password: string) => setPassword(password), [setPassword])
  const onConfirmPasswordInput = useCallback((password: string) => setConfirmPassword(password), [setConfirmPassword])

  // update password
  const handlePasswordUpdate = useCallback(
    async (event) => {
      event.preventDefault()

      setClientError(null)

      if (!email || typeof username !== 'string' || typeof token !== 'string') return

      if (password !== confirmPassword) {
        setClientError(formatError('Passwords do not match', 'passwordConfirmation'))
        return
      }

      // Check password
      const passwordError = await validatePassword(email, username, password)
      if (passwordError !== null) {
        setClientError(formatError(passwordError))
        return
      }

      const hashedPassword = await passwordHasher(password)

      try {
        const { publicKey, address, rulesPrivateKey } = await createWallet(password)

        const { accessToken } = await updatePasswordMutation({
          variables: {
            email,
            newPassword: hashedPassword,
            walletPublicKey: publicKey,
            walletAddress: address,
            rulesPrivateKey,
            token,
          },
        })

        if (accessToken) {
          onSuccessfulConnection({ accessToken })
          redirect('/')
        }
      } catch (error: any) {
        setClientError(formatError(`${error.message}, contact support if the error persist.`))
        return
      }
    },
    [password, confirmPassword, updatePasswordMutation, username, onSuccessfulConnection, redirect]
  )

  return (
    <>
      <ModalHeader onDismiss={toggleAuthModal} title={t`Update password`} />

      <ModalBody>
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
                $valid={error?.id !== 'password'}
              />

              <Input
                id="password-confirmation"
                value={confirmPassword}
                placeholder={t`Confirm password`}
                type="password"
                autoComplete="new-password"
                onUserInput={onConfirmPasswordInput}
                $valid={error?.id !== 'passwordConfirmation'}
              />

              {error?.render()}
            </Column>

            <SubmitButton type="submit" onClick={handlePasswordUpdate} disabled={loading} large>
              {loading && !error ? 'Loading ...' : t`Submit`}
            </SubmitButton>
          </Column>
        </StyledForm>
      </ModalBody>
    </>
  )
}
