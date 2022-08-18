import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'
import { ec, Account, Call, EstimateFee } from 'starknet'
import { WeiAmount } from '@rulesorg/sdk-core'

import Input from '@/components/Input'
import Column, { ColumnCenter } from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { decryptRulesPrivateKey } from '@/utils/wallet'
import { PrimaryButton } from '@/components/Button'
import { useStarknet } from '@/lib/starknet'
import { useCurrentUser } from '@/state/user/hooks'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'

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

const NetworkFeeWrapper = styled(RowCenter)`
  justify-content: space-between;
  padding: 24px;
  background: ${({ theme }) => theme.bg3};
  border-radius: 4px;

  ${({ theme }) => theme.media.extraSmall`
    padding: 16px;
  `}
`

interface StarknetSignerProps {
  isOpen: boolean
  call: Call
  onTransaction(tx: string): void
  onWaitingForFees(estimating: boolean): void
  onConfirmation(): void
  onError(error: string): void
}

export default function StarknetSigner({
  isOpen,
  call,
  onTransaction,
  onWaitingForFees,
  onConfirmation,
  onError,
}: StarknetSignerProps) {
  // password
  const [password, setPassword] = useState('')
  const onPasswordInput = useCallback((value: string) => setPassword(value), [setPassword])

  // wallet
  const currentUser = useCurrentUser()
  const rulesPrivateKey = currentUser.starknetWallet.rulesPrivateKey
  const address = currentUser.starknetWallet.address

  // errors
  const [error, setError] = useState<string | null>(null)

  // starknet account
  const [account, setAccount] = useState<Account | null>(null)

  // network fee
  const [networkFee, setNetworkFee] = useState<{ fee: WeiAmount; maxFee: WeiAmount } | null>(null)
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // tx
  const { provider } = useStarknet()
  const [waitingForTx, setWaitingForTx] = useState(false)

  // prepare transaction
  const prepareTransaction = useCallback(
    (event) => {
      event.preventDefault()

      decryptRulesPrivateKey(rulesPrivateKey, password)
        .catch((error: Error) => {
          console.error(error)

          setError(error.message)
          return Promise.reject()
        })
        .then((res: string) => {
          const keyPair = ec.getKeyPair(res)
          if (!keyPair || !provider) {
            setError('Failed to sign transaction')
            return
          }
          const account = new Account(provider, address, keyPair)

          setAccount(account)
          onWaitingForFees(true)
          return account.estimateFee([call])
        })
        .then((estimatedFees?: EstimateFee) => {
          const maxFee = estimatedFees?.suggestedMaxFee.toString() ?? '0'
          const fee = estimatedFees?.amount.toString() ?? '0'
          if (maxFee === '0' || fee === '0') {
            onError('Failed to estimate fees')
            return
          }

          onWaitingForFees(false)
          setNetworkFee({ maxFee: WeiAmount.fromRawAmount(maxFee), fee: WeiAmount.fromRawAmount(fee) })
          console.log('hey')
        })
        .catch((error?: Error) => {
          if (!error) return
          console.error(error)

          onError(error.message)
        })
    },
    [password, rulesPrivateKey, address, provider, onTransaction, call, onError, onWaitingForFees]
  )

  // sign transaction
  const signTransaction = useCallback((event) => {
    event.preventDefault()

    console.log('TODO: sign')
  }, [])

  if (!isOpen) return null

  return (
    <StyledStarknetSigner gap={26}>
      {networkFee ? (
        <StyledForm onSubmit={signTransaction}>
          <Column gap={20}>
            <NetworkFeeWrapper>
              <TYPE.body fontWeight={700}>
                <Trans>Network fee</Trans>
              </TYPE.body>
              <Column gap={8} alignItems="end">
                <TYPE.body>
                  {networkFee.fee.toSignificant(4)} ETH ({weiAmountToEURValue(networkFee.fee)}€)
                </TYPE.body>
                <TYPE.subtitle fontSize={12}>
                  Max {networkFee.maxFee.toSignificant(4)} ETH ({weiAmountToEURValue(networkFee.maxFee)}€)
                </TYPE.subtitle>
              </Column>
            </NetworkFeeWrapper>

            <SubmitButton type="submit" large>
              <Trans>Confirm</Trans>
            </SubmitButton>
          </Column>
        </StyledForm>
      ) : (
        <StyledForm onSubmit={prepareTransaction}>
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
