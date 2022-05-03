import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useMutation, gql } from '@apollo/client'

import { EMAIL_VERIFICATION_CODE_LENGTH } from '@/constants/misc'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { BackButton } from '@/components/Button'
import { AuthMode } from '@/state/auth/actions'
import { useAuthForm, useAuthActionHanlders, useSetAuthMode } from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import useCreateWallet from '@/hooks/useCreateWallet'

import Close from '@/images/close.svg'

const StyledClose = styled(Close)`
  width: 20px;
  height: 20px;
  cursor: pointer;
`

const SIGN_UP_MUTATION = gql`
  mutation (
    $email: String!
    $username: String!
    $password: String!
    $starknetAddress: String!
    $rulesPrivateKey: RulesPrivateKeyAttributes!
    $rulesPrivateKeyBackup: String!
    $emailVerificationCode: String!
  ) {
    signUp(
      input: {
        email: $email
        username: $username
        password: $password
        starknetAddress: $starknetAddress
        rulesPrivateKey: $rulesPrivateKey
        rulesPrivateKeyBackup: $rulesPrivateKeyBackup
        emailVerificationCode: $emailVerificationCode
      }
    ) {
      accessToken
    }
  }
`

interface EmailVerificationFormProps {
  onSuccessfulConnexion: (accessToken?: string) => void
}

export default function EmailVerificationForm({ onSuccessfulConnexion }: SignUpFormProps) {
  // Wallet
  const createWallet = useCreateWallet()

  // Loading
  const [loading, setLoading] = useState(false)

  // graphql mutations
  const [signUpMutation, signUpResult] = useMutation(SIGN_UP_MUTATION)

  // fields
  const { email, username, password, emailVerificationCode } = useAuthForm()
  const { onEmailVerificationCodeInput } = useAuthActionHanlders()

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  useEffect(async () => {
    if (emailVerificationCode.length !== EMAIL_VERIFICATION_CODE_LENGTH) return

    setLoading(true)

    const walletInfos = await createWallet(password)
    if (!walletInfos) return

    const { starknetAddress, userKey: rulesPrivateKey, backupKey: rulesPrivateKeyBackup } = walletInfos

    signUpMutation({
      variables: {
        email,
        username,
        password,
        starknetAddress,
        rulesPrivateKey,
        rulesPrivateKeyBackup,
        emailVerificationCode,
      },
    })
      .then((res: any) => onSuccessfulConnexion(res?.data?.signUp?.accessToken))
      .catch((err: Error) => {
        console.error(err)
        setLoading(false)
      })
  }, [emailVerificationCode, email, username, password, signUpMutation, createWallet])

  return (
    <>
      <RowCenter justify="space-between" style={{ padding: '0 8px' }}>
        <BackButton onClick={() => setAuthMode(AuthMode.SIGN_UP)} />
        <StyledClose onClick={toggleAuthModal} />
      </RowCenter>

      <Column gap={26}>
        <TYPE.large>Enter the code to confirm your registration</TYPE.large>
        <Input
          id="emailVerificationCode"
          value={emailVerificationCode}
          placeholder="Code"
          type="text"
          onUserInput={onEmailVerificationCodeInput}
          disabled={loading}
        />
      </Column>
    </>
  )
}
