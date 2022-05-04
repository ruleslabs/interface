import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'

import { EMAIL_VERIFICATION_CODE_LENGTH } from '@/constants/misc'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { BackButton } from '@/components/Button'
import { AuthMode } from '@/state/auth/actions'
import {
  useAuthForm,
  useAuthActionHanlders,
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

import Close from '@/images/close.svg'

const StyledClose = styled(Close)`
  width: 20px;
  height: 20px;
  cursor: pointer;
`

const ResendCode = styled(TYPE.subtitle)`
  display: inline;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
`

interface EmailVerificationFormProps {
  onSuccessfulConnexion: (accessToken?: string) => void
}

export default function EmailVerificationForm({ onSuccessfulConnexion }: SignUpFormProps) {
  // Wallet
  const createWallet = useCreateWallet()
  const [walletInfos, setWalletInfos] = useState<WalletInfos | null>(null)

  // Loading
  const [loading, setLoading] = useState(false)

  // graphql mutations
  const [signUpMutation] = useSignUpMutation()
  const [prepareSignUpMutation] = usePrepareSignUpMutation()

  // fields
  const { email, username, password, emailVerificationCode } = useAuthForm()
  const { onEmailVerificationCodeInput } = useAuthActionHanlders()

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // Countdown
  const newEmailVerificationCodeTime = useNewEmailVerificationCodeTime()
  const refreshNewEmailVerificationCodeTime = useRefreshNewEmailVerificationCodeTime()
  const countdown = useCountdown(new Date(newEmailVerificationCodeTime))

  // errors
  const [error, setError] = useState<{ message?: string; id?: string }>({})

  // signUp
  useEffect(async () => {
    if (emailVerificationCode.length !== EMAIL_VERIFICATION_CODE_LENGTH) return

    setLoading(true)

    const hashedPassword = await passwordHasher(password)

    let newWalletInfos = walletInfos

    try {
      if (!newWalletInfos) {
        newWalletInfos = await createWallet(password)
        setWalletInfos(newWalletInfos)
      }
    } catch (error: Error) {
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
      },
    })
      .then((res: any) => onSuccessfulConnexion(res?.data?.signUp?.accessToken))
      .catch((signUpError: Error) => {
        const error = signUpError?.graphQLErrors?.[0]
        if (error) setError({ message: error.message, id: 'emailVerificationCode' })
        else setError({})

        console.error(signUpError)
        setLoading(false)
      })
  }, [emailVerificationCode, email, username, password, signUpMutation, createWallet, setWalletInfos])

  // new code
  const handleNewCode = useCallback(
    async (event) => {
      event.preventDefault()

      onEmailVerificationCodeInput('')
      setLoading(true)

      prepareSignUpMutation({ variables: { username, email } })
        .then((res: any) => {
          if (!res?.data?.prepareSignUp?.error) setAuthMode(AuthMode.EMAIL_VERIFICATION)
          setLoading(false)
          refreshNewEmailVerificationCodeTime()
        })
        .catch((prepareSignUpError: Error) => {
          const error = prepareSignUpError?.graphQLErrors?.[0]
          if (error) setError({ message: error.message, id: error.extensions?.id })
          else if (!loading) setError({})

          console.error(prepareSignUpError)
          setLoading(false)
        })
    },
    [email, username, prepareSignUpMutation, setAuthMode, onEmailVerificationCodeInput]
  )

  return (
    <>
      <RowCenter justify="space-between" style={{ padding: '0 8px' }}>
        <BackButton onClick={() => setAuthMode(AuthMode.SIGN_UP)} />
        <StyledClose onClick={toggleAuthModal} />
      </RowCenter>

      <Column gap={26}>
        <TYPE.large>Enter the code to confirm your registration</TYPE.large>

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

          <TYPE.body color="error">{error.message}</TYPE.body>
        </Column>

        <Column gap={8}>
          <TYPE.body>The code has been emailed to {email}</TYPE.body>
          {countdown?.seconds ? (
            <TYPE.subtitle>New code in {countdown.seconds} seconds</TYPE.subtitle>
          ) : (
            <ResendCode onClick={handleNewCode}>Resend the code</ResendCode>
          )}
        </Column>
      </Column>
    </>
  )
}
