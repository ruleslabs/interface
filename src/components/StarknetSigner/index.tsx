import JSBI from 'jsbi'
import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'
import { ec, Account, Call, EstimateFee, AddTransactionResponse } from 'starknet'
import { WeiAmount } from '@rulesorg/sdk-core'
import { ApolloError } from '@apollo/client'

import { useConsumeNonceMutation } from '@/state/wallet/hooks'
import Input from '@/components/Input'
import { useETHBalances } from '@/state/wallet/hooks'
import Column, { ColumnCenter } from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { decryptRulesPrivateKey } from '@/utils/wallet'
import { PrimaryButton } from '@/components/Button'
import { useStarknet } from '@/lib/starknet'
import { useCurrentUser } from '@/state/user/hooks'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import ErrorCard from '@/components/ErrorCard'
import { useDepositModalToggle } from '@/state/application/hooks'

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
  background: ${({ theme }) => theme.bg5};
  border-radius: 4px;

  ${({ theme }) => theme.media.extraSmall`
    padding: 16px;
  `}
`

interface StarknetSignerProps {
  isOpen: boolean
  call?: Call
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
  // deposit modal
  const toggleDepositModal = useDepositModalToggle()

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

  // balance
  const balance =
    useETHBalances([currentUser?.starknetWallet.address])[currentUser?.starknetWallet.address] ??
    WeiAmount.fromRawAmount(0)

  // network fee
  const [networkFee, setNetworkFee] = useState<{ fee: WeiAmount; maxFee: WeiAmount } | null>(null)
  const weiAmountToEURValue = useWeiAmountToEURValue()
  const canPayFee = useMemo(() => {
    if (!networkFee?.maxFee) return false
    return JSBI.greaterThanOrEqual(balance.quotient, networkFee.maxFee.quotient)
  }, [networkFee?.maxFee, balance.quotient])

  // tx
  const { provider } = useStarknet()
  const [waitingForTx, setWaitingForTx] = useState(false)

  // prepare transaction
  const prepareTransaction = useCallback(
    (event) => {
      event.preventDefault()

      if (!call) return

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
        })
        .catch((error?: Error) => {
          if (!error) return
          console.error(error)

          onError(error.message)
        })
    },
    [password, rulesPrivateKey, address, provider, onTransaction, call, onError, onWaitingForFees]
  )

  // nonce mgmt
  const [consumeNonceMutation] = useConsumeNonceMutation()

  // sign transaction
  const signTransaction = useCallback(
    (event) => {
      event.preventDefault()

      if (!account || !networkFee?.maxFee || !call) return

      onConfirmation()

      consumeNonceMutation()
        .catch((error: ApolloError) => {
          console.error(error)

          onError('Failed to consume nonce')
          return Promise.reject()
        })
        .then((res: any) => {
          const nextNonce = res?.data?.consumeNonce
          if (nextNonce !== 0 && !nextNonce) {
            onError('Failed to consume nonce')
            return
          }

          console.log('yo')

          return account.execute(call, undefined, { nonce: nextNonce, maxFee: networkFee.maxFee.quotient.toString() })
        })
        .then((transaction?: AddTransactionResponse) => {
          if (transaction?.code !== 'TRANSACTION_RECEIVED') {
            onError('Transaction not received')
            return
          }

          onTransaction(transaction.transaction_hash)
        })
        .catch((error: Error) => {
          if (!error) return
          console.error(error)

          onError(error.message)
        })
    },
    [onTransaction, consumeNonceMutation, onError, call, account, networkFee?.maxFee, onConfirmation]
  )

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

            {!canPayFee && (
              <ErrorCard textAlign="center">
                <Trans>
                  You do not have enough ETH in your Rules wallet to pay for network fees on Starknet.
                  <br />
                  <span onClick={toggleDepositModal}>Buy ETH or deposit from another wallet</span>
                </Trans>
              </ErrorCard>
            )}

            <SubmitButton type="submit" disabled={!canPayFee} large>
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
