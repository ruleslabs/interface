import { t, Trans } from '@lingui/macro'
import { useCallback, useState } from 'react'
import { PrimaryButton } from 'src/components/Button'
import Column from 'src/components/Column'
import Input from 'src/components/Input'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { TYPE } from 'src/styles/theme'
import { decryptRulesPrivateKey } from 'src/utils/wallet'
import styled from 'styled-components/macro'

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
            <TYPE.body color="error">
              <Trans id={error}>{error}</Trans>
            </TYPE.body>
          )}
        </Column>

        <SubmitButton type="submit" disabled={!password.length} large>
          <Trans>Next</Trans>
        </SubmitButton>
      </Column>
    </StyledForm>
  )
}
