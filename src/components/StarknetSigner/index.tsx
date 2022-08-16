import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { Trans, t } from '@lingui/macro'
import { ec, Account, Call } from 'starknet'

import Input from '@/components/Input'
import Column, { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { decryptRulesPrivateKey } from '@/utils/wallet'
import { PrimaryButton } from '@/components/Button'
import { useStarknet } from '@/lib/starknet'

const WALLET_QUERY = gql`
  query {
    currentUser {
      starknetAddress
      rulesPrivateKey {
        encryptedPrivateKey
        iv
        salt
      }
    }
  }
`

const StyledStarknetSigner = styled(ColumnCenter)`
  padding-bottom: 8px;
  gap: 32px;
`

const StyledForm = styled.form`
  width: 100%;
`

const SubmitButton = styled(PrimaryButton)`
  width: 100%;
  height: 55px;
  margin-top: 12px;
`

interface StarknetSignerProps {
  call: Call
  onTransaction(tx: string): void
  onConfirmation(): void
  onError(): void
}

export default function StarknetSigner({ call, onTransaction, onConfirmation, onError }: StarknetSignerProps) {
  // password
  const [password, setPassword] = useState('')
  const onPasswordInput = useCallback((value: string) => setPassword(value), [setPassword])

  // wallet
  const rulesPrivateKeyQuery = useQuery(WALLET_QUERY)

  const rulesPrivateKey = rulesPrivateKeyQuery.data?.currentUser?.rulesPrivateKey
  const address = rulesPrivateKeyQuery.data?.currentUser?.starknetAddress
  const isValid = rulesPrivateKey && address && !rulesPrivateKeyQuery.error
  const loading = rulesPrivateKeyQuery.loading

  // errors
  const [error, setError] = useState<string | null>(null)

  // tx
  const { provider } = useStarknet()
  const [waitingForTx, setWaitingForTx] = useState(false)

  const signTransaction = useCallback(
    (event) => {
      event.preventDefault()

      decryptRulesPrivateKey(rulesPrivateKey, password)
        .catch((error: Error) => {
          console.error(error)

          setError(error.message)
          return Promise.reject()
        })
        .then((res: string) => {
          onConfirmation()

          const keyPair = ec.getKeyPair(res)
          if (!keyPair) {
            setError('Failed to sign transaction')
            return
          }
          const account = new Account(provider, address, keyPair)

          return account.execute([call])
        })
        .then((transaction: any) => {
          console.log('ok')
          console.log(transaction)
        })
        .catch((error?: Error) => {
          if (!error) return
          console.error(error)

          onError(error.message)
        })
    },
    [password, rulesPrivateKey, address, provider, onTransaction, call, onConfirmation, onError]
  )

  return (
    <StyledStarknetSigner gap={26}>
      <StyledForm onSubmit={signTransaction}>
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

          <SubmitButton type="submit" large>
            <Trans>Confirm</Trans>
          </SubmitButton>
        </Column>
      </StyledForm>
    </StyledStarknetSigner>
  )
}
