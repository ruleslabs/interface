import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import Input from '@/components/Input'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { decryptRulesPrivateKey } from '@/utils/wallet'
import { PrimaryButton } from '@/components/Button'
import useCurrentUser from '@/hooks/useCurrentUser'

const StyledForm = styled.form`
  width: 100%;
`

const SubmitButton = styled(PrimaryButton)`
  width: 100%;
  height: 55px;
`

interface PrivateKeyDecipherFormProps {
  onPrivateKeyDeciphered(privateKey: string): void
}

export default function PrivateKeyDecipherForm({ onPrivateKeyDeciphered }: PrivateKeyDecipherFormProps) {
  // password
  const [password, setPassword] = useState('')
  const onPasswordInput = useCallback((value: string) => setPassword(value), [setPassword])

  // wallet
  const { currentUser } = useCurrentUser()
  const rulesPrivateKey = currentUser?.starknetWallet.rulesPrivateKey

  // errors
  const [error, setError] = useState<string | null>(null)

  // prepare transaction
  const decipherPrivateKey = useCallback(
    async (event) => {
      event.preventDefault()

      if (!rulesPrivateKey) return

      try {
        const pk = await decryptRulesPrivateKey(rulesPrivateKey, password)
        onPrivateKeyDeciphered(pk)
      } catch (error) {
        setError(error.message ?? 'Unknown error')
      }
    },
    [password, rulesPrivateKey, onPrivateKeyDeciphered]
  )

  return (
    <StyledForm onSubmit={decipherPrivateKey}>
      <Column gap={20}>
        <Column gap={12}>
          <Input
            id="password"
            value={password}
            placeholder={t`Password`}
            type="password"
            autoComplete="password"
            onUserInput={onPasswordInput}
            $valid={!error}
          />

          {error && (
            <Trans id={error} render={({ translation }) => <TYPE.body color="error">{translation}</TYPE.body>} />
          )}
        </Column>

        <SubmitButton type="submit" disabled={!password.length} large>
          <Trans>Next</Trans>
        </SubmitButton>
      </Column>
    </StyledForm>
  )
}
