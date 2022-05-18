import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { ApolloError } from '@apollo/client'
import { Trans } from '@lingui/macro'

import { ModalHeader } from '@/components/Modal'
import { EMAIL_VERIFICATION_CODE_LENGTH } from '@/constants/misc'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { BackButton } from '@/components/Button'
import { AuthMode } from '@/state/auth/actions'
import {
  useAuthForm,
  useSetAuthMode,
  useRefreshNewEmailVerificationCodeTime,
  useNewEmailVerificationCodeTime,
  useSignUpMutation,
  usePrepareSignUpMutation,
} from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import useCreateWallet, { WalletInfos } from '@/hooks/useCreateWallet'
import useCountdown from '@/hooks/useCountdown'
import { passwordHasher } from '@/utils/password'

const ResendCode = styled(TYPE.subtitle)`
  display: inline;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
`

interface EmailVerificationFormProps {
  onSuccessfulConnection: (accessToken?: string, onboard?: boolean) => void
}

export default function EmailVerificationForm({ onSuccessfulConnection }: EmailVerificationFormProps) {
  // Wallet
  const createWallet = useCreateWallet()
  const [walletInfos, setWalletInfos] = useState<WalletInfos | null>(null)

  // Loading
  const [loading, setLoading] = useState(false)

  // graphql mutations
  const [signUpMutation] = useSignUpMutation()
  const [prepareSignUpMutation] = usePrepareSignUpMutation()

  // fields
  const [emailVerificationCode, setEmailVerificationCode] = useState('')
  const onEmailVerificationCodeInput = useCallback(
    (code: string) => {
      if (/^[\d]*$/.test(code) && code.length <= EMAIL_VERIFICATION_CODE_LENGTH) setEmailVerificationCode(code)
    },
    [setEmailVerificationCode]
  )
  const {
    email,
    username,
    password,
    checkboxes: { acceptCommercialEmails },
  } = useAuthForm()

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // Countdown
  const newEmailVerificationCodeTime = useNewEmailVerificationCodeTime()
  const refreshNewEmailVerificationCodeTime = useRefreshNewEmailVerificationCodeTime()
  const countdown = useCountdown(new Date(newEmailVerificationCodeTime ?? 0))

  // errors
  const [error, setError] = useState<{ message?: string; id?: string }>({})

  // signUp
  useEffect(() => {
    if (emailVerificationCode.length !== EMAIL_VERIFICATION_CODE_LENGTH) return

    setLoading(true)

    const signUp = async () => {
      const hashedPassword = await passwordHasher(password)

      let newWalletInfos = walletInfos

      try {
        if (!newWalletInfos) {
          newWalletInfos = await createWallet(password)
          setWalletInfos(newWalletInfos)
        }
      } catch (error: any) {
        setError({ message: `${error.message}, contact support if the error persist.` })

        console.error(error)
        setLoading(false)
        return
      }

      const { starknetAddress, userKey: rulesPrivateKey, backupKey: rulesPrivateKeyBackup } = newWalletInfos

      signUpMutation({
        variables: {
          email,
          username,
          password: hashedPassword,
          starknetAddress,
          rulesPrivateKey,
          rulesPrivateKeyBackup,
          emailVerificationCode,
          acceptCommercialEmails,
        },
      })
        .then((res: any) => onSuccessfulConnection(res?.data?.signUp?.accessToken, true))
        .catch((signUpError: ApolloError) => {
          const error = signUpError?.graphQLErrors?.[0]
          if (error) setError({ message: error.message, id: 'emailVerificationCode' })
          else setError({})

          console.error(signUpError)
        })
    }
    signUp().then(() => setLoading(false))
  }, [emailVerificationCode, email, username, password, signUpMutation, createWallet, setWalletInfos])

  // new code
  const handleNewCode = useCallback(
    async (event) => {
      event.preventDefault()

      setEmailVerificationCode('')
      setLoading(true)

      prepareSignUpMutation({ variables: { username, email } })
        .then((res: any) => {
          if (!res?.data?.prepareSignUp?.error) setAuthMode(AuthMode.EMAIL_VERIFICATION)
          setLoading(false)
          refreshNewEmailVerificationCodeTime()
        })
        .catch((prepareSignUpError: ApolloError) => {
          const error = prepareSignUpError?.graphQLErrors?.[0]
          if (error) setError({ message: error.message, id: error.extensions?.id as string })
          else if (!loading) setError({})

          console.error(prepareSignUpError)
          setLoading(false)
        })
    },
    [email, username, prepareSignUpMutation, setAuthMode, setEmailVerificationCode]
  )

  return (
    <>
      <ModalHeader onDismiss={toggleAuthModal}>
        <BackButton onClick={() => setAuthMode(AuthMode.SIGN_UP)} />
      </ModalHeader>

      <Column gap={26}>
        <TYPE.large>
          <Trans>Enter the code to confirm your registration</Trans>
        </TYPE.large>

        <Column gap={12}>
          <Input
            id="emailVerificationCode"
            value={emailVerificationCode}
            placeholder="Code"
            type="text"
            onUserInput={onEmailVerificationCodeInput}
            loading={emailVerificationCode.length > 0 && loading}
            $valid={error.id !== 'emailVerificationCode' || loading}
          />

          {error.message && (
            <Trans
              id={error.message}
              render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>}
            />
          )}
        </Column>

        <Column gap={8}>
          <TYPE.body>
            <Trans>The code has been emailed to {email}</Trans>
          </TYPE.body>
          {countdown?.seconds ? (
            <TYPE.subtitle>
              <Trans>New code in {countdown.seconds} seconds</Trans>
            </TYPE.subtitle>
          ) : (
            <ResendCode onClick={handleNewCode}>
              <Trans>Resend the code</Trans>
            </ResendCode>
          )}
        </Column>
      </Column>
    </>
  )
}
