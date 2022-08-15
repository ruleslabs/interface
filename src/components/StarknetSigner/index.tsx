import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { Trans, t } from '@lingui/macro'
import { Call } from 'starknet'

import Input from '@/components/Input'
import Column, { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { DecryptionError } from '@/utils/encryption'
import { decryptRulesPrivateKey } from '@/utils/wallet'
import { PrimaryButton } from '@/components/Button'

const PRIVATE_KEY_QUERY = gql`
  query {
    currentUser {
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
}

export default function StarknetSigner({ call, onTransaction }: StarknetSignerProps) {
  const [password, setPassword] = useState('')
  const onPasswordInput = useCallback((value: string) => setPassword(value), [setPassword])

  const rulesPrivateKeyQuery = useQuery(PRIVATE_KEY_QUERY)

  const rulesPrivateKey = rulesPrivateKeyQuery.data?.currentUser?.rulesPrivateKey
  const isValid = rulesPrivateKey && !rulesPrivateKeyQuery.error
  const loading = rulesPrivateKeyQuery.loading

  // errors
  const [error, setError] = useState<string | null>(null)

  const signTransaction = useCallback(
    (event) => {
      event.preventDefault()

      decryptRulesPrivateKey(rulesPrivateKey, password)
        .then((res: string) => {
          console.log(res)
          console.log('sign transaction') // TODO
          onTransaction('0x00dead00')
        })
        .catch((error: DecryptionError) => {
          console.error(error)
          setError(error.message)
        })
    },
    [password, rulesPrivateKey]
  )

  return (
    <StyledStarknetSigner gap={26}>
      {loading ? (
        <TYPE.body textAlign="center">Loading...</TYPE.body>
      ) : !isValid ? (
        <TYPE.body textAlign="center">
          <Trans>An error has occured</Trans>
        </TYPE.body>
      ) : (
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
      )}
    </StyledStarknetSigner>
  )
}
