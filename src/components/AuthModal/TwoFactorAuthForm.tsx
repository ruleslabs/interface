import { useState, useCallback } from 'react'
// import styled from 'styled-components'
// import { ApolloError } from '@apollo/client'
import { Trans } from '@lingui/macro'

import { ModalHeader } from '@/components/Modal'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { BackButton } from '@/components/Button'
import { AuthMode } from '@/state/auth/actions'
import { useAuthModalToggle } from '@/state/application/hooks'
import { useSetAuthMode } from '@/state/auth/hooks'

interface TwoFactorAuthFormProps {
  onSuccessfulConnection: (accessToken?: string, onboard?: boolean) => void
}

export default function TwoFactorAuthForm({ onSuccessfulConnection }: EmailVerificationFormProps) {
  // Loading
  const [loading, setLoading] = useState(false)

  // fields
  const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('')
  const onTwoFactorAuthInput = useCallback(
    (code: string) => {
      if (/^[\d]*$/.test(code) && code.length <= 6) setTwoFactorAuthCode(code)
    },
    [setTwoFactorAuthCode]
  )

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // errors
  const [error, setError] = useState<{ message?: string; id?: string }>({})

  return (
    <>
      <ModalHeader onDismiss={toggleAuthModal}>
        <BackButton onClick={() => setAuthMode(AuthMode.SIGN_IN)} />
      </ModalHeader>

      <Column gap={26}>
        <TYPE.large>
          <Trans>Enter the 2FA code to sign in</Trans>
        </TYPE.large>

        <Column gap={12}>
          <Input
            id="twoFactorAuthCode"
            value={twoFactorAuthCode}
            placeholder="Code"
            type="text"
            onUserInput={onTwoFactorAuthInput}
            loading={twoFactorAuthCode.length > 0 && loading}
            $valid={error.id !== 'twoFactorAuthCode' || loading}
          />

          {error.message && (
            <Trans
              id={error.message}
              render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>}
            />
          )}
        </Column>
      </Column>
    </>
  )
}
