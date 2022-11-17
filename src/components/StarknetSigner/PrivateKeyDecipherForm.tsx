import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import Input from '@/components/Input'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { decryptRulesPrivateKey } from '@/utils/wallet'
import { PrimaryButton } from '@/components/Button'
import { useCurrentUser } from '@/state/user/hooks'

const StyledForm = styled.form`
  width: 100%;
`

const SubmitButton = styled(PrimaryButton)`
  width: 100%;
  height: 55px;
`

interface PrivateKeyDecipherFormProps {
  confirmationActionText?: string
  onPrivateKeyDeciphered(privateKey: string): void
}

export default function PrivateKeyDecipherForm({
  confirmationActionText,
  onPrivateKeyDeciphered,
}: PrivateKeyDecipherFormProps) {
  // password
  const [password, setPassword] = useState('')
  const onPasswordInput = useCallback((value: string) => setPassword(value), [setPassword])

  // wallet
  const currentUser = useCurrentUser()
  const rulesPrivateKey = currentUser.starknetWallet.rulesPrivateKey

  // errors
  const [error, setError] = useState<string | null>(null)

  // prepare transaction
  const decipherPrivateKey = useCallback(
    (event) => {
      event.preventDefault()

      decryptRulesPrivateKey(rulesPrivateKey, password)
        .then((res: string) => {
          onPrivateKeyDeciphered(res)
        })
        .catch((error: Error) => {
          console.error(error)

          setError(error.message)
          return Promise.reject()
        })
    },
    [password, rulesPrivateKey]
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
          {confirmationActionText ?? <Trans>Confirm</Trans>}
        </SubmitButton>
      </Column>
    </StyledForm>
  )
}
