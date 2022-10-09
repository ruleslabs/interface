import JSBI from 'jsbi'
import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'
import { ec, number, Account, Call, EstimateFee, Signature, KeyPair } from 'starknet'
import { WeiAmount } from '@rulesorg/sdk-core'

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
import { ErrorCard } from '@/components/Card'
import { useDepositModalToggle } from '@/state/application/hooks'
import getNonce from '@/utils/getNonce'
import estimateFee from '@/utils/estimateFee'
import signTransaction from '@/utils/signTransaction'

const StyledSigner = styled(ColumnCenter)`
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

const FeeWrapper = styled(RowCenter)`
  justify-content: space-between;
  padding: 24px;
  background: ${({ theme }) => theme.bg5};
  border-radius: 4px;

  ${({ theme }) => theme.media.extraSmall`
    padding: 16px;
  `}
`

interface SignerProps {
  confirmationActionText?: string
  isOpen: boolean
  calls?: Call[]
  transactionValue?: string
  onWaitingForFees(estimating: boolean): void
  onConfirmation(): void
  onSignature(signature: Signature, maxFee: string, nonce: string): void
  onError(error: string): void
}

export default function Signer({
  confirmationActionText,
  isOpen,
  calls,
  transactionValue,
  onWaitingForFees,
  onConfirmation,
  onSignature,
  onError,
}: SignerProps) {
  // deposit modal
  const toggleDepositModal = useDepositModalToggle()

  // password
  const [password, setPassword] = useState('')
  const onPasswordInput = useCallback((value: string) => setPassword(value), [setPassword])

  // wallet
  const currentUser = useCurrentUser()
  const rulesPrivateKey = currentUser.starknetWallet.rulesPrivateKey
  const address = currentUser.starknetWallet.address
  const transactionVersion = currentUser.starknetWallet.transactionVersion

  // errors
  const [error, setError] = useState<string | null>(null)

  // starknet account
  const [account, setAccount] = useState<Account | null>(null)
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null)

  // balance
  const balance =
    useETHBalances([currentUser?.starknetWallet.address])[currentUser?.starknetWallet.address] ??
    WeiAmount.fromRawAmount(0)

  // network fee
  const [parsedNetworkFee, setNetworkFee] = useState<{ fee: WeiAmount; maxFee: WeiAmount } | null>(null)
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // total cost
  const parsedTotalCost: { cost: WeiAmount; maxCost: WeiAmount } | null = useMemo(() => {
    if (!parsedNetworkFee?.maxFee || !transactionValue) return null

    return {
      cost: WeiAmount.fromRawAmount(transactionValue).add(parsedNetworkFee.fee),
      maxCost: WeiAmount.fromRawAmount(transactionValue).add(parsedNetworkFee.maxFee),
    }
  }, [transactionValue, parsedNetworkFee?.maxFee])

  // can pay
  const canPayTransaction = useMemo(() => {
    if (!parsedTotalCost?.maxCost && !parsedNetworkFee?.maxFee) return false

    return JSBI.greaterThanOrEqual(balance.quotient, (parsedTotalCost?.maxCost ?? parsedNetworkFee?.maxFee)!.quotient)
  }, [parsedTotalCost?.maxCost.quotient, parsedNetworkFee?.maxFee.quotient, balance.quotient])

  // tx
  const { provider } = useStarknet()
  const [waitingForTx, setWaitingForTx] = useState(false)

  // prepare transaction
  const prepareTransaction = useCallback(
    (event) => {
      event.preventDefault()

      if (!calls) return

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
          setKeyPair(keyPair)

          onWaitingForFees(true)
          return estimateFee(account, keyPair, calls, transactionVersion)
        })
        .then((estimatedFees?: EstimateFee) => {
          const maxFee = estimatedFees?.suggestedMaxFee.toString() ?? '0'
          const fee = estimatedFees?.overall_fee.toString() ?? '0'
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
    [password, rulesPrivateKey, address, provider, calls, onError, onWaitingForFees, transactionVersion]
  )

  // tx signature
  const handleSignature = useCallback(
    (event) => {
      event.preventDefault()

      if (!account || !keyPair || !parsedNetworkFee?.maxFee || !calls) return

      onConfirmation()

      let nonce: string | null

      getNonce(account, transactionVersion)
        .catch((error: Error) => {
          console.error(error)

          onError('Failed to get next nonce')
          return Promise.reject()
        })
        .then((nonceBN: number.BigNumberish) => {
          nonce = number.toHex(number.toBN(nonceBN))

          const signerDetails = {
            walletAddress: account.address,
            maxFee: parsedNetworkFee.maxFee.quotient.toString(),
            version: number.toBN(transactionVersion),
            chainId: account.chainId,
            nonce,
          }

          return signTransaction(calls, signerDetails, transactionVersion, { keyPair })
        })
        .then((signature?: Signature) => {
          if (!signature) {
            onError('Failed to sign transaction')
            return
          }

          onSignature(signature, parsedNetworkFee.maxFee.quotient.toString(), nonce!)
        })
        .catch((error: Error) => {
          if (!error) return
          console.error(error)

          onError(`Failed to sign transaction: ${error.message}`)
        })
    },
    [onError, calls, account, keyPair, parsedNetworkFee?.maxFee, onSignature, transactionVersion]
  )

  if (!isOpen) return null

  return (
    <StyledSigner gap={26}>
      {parsedNetworkFee ? (
        <StyledForm onSubmit={handleSignature}>
          <Column gap={20}>
            <Column gap={12}>
              <FeeWrapper>
                <TYPE.body fontWeight={700}>
                  <Trans>Network fee</Trans>
                </TYPE.body>
                <Column gap={8} alignItems="end">
                  <TYPE.body>
                    {parsedNetworkFee.fee.toSignificant(4)} ETH ({weiAmountToEURValue(parsedNetworkFee.fee)}€)
                  </TYPE.body>
                  <TYPE.subtitle fontSize={12}>
                    Max {parsedNetworkFee.maxFee.toSignificant(4)} ETH ({weiAmountToEURValue(parsedNetworkFee.maxFee)}€)
                  </TYPE.subtitle>
                </Column>
              </FeeWrapper>
            </Column>

            {parsedTotalCost && transactionValue && (
              <FeeWrapper>
                <TYPE.body fontWeight={700}>
                  <Trans>Total</Trans>
                </TYPE.body>
                <Column gap={8} alignItems="end">
                  <TYPE.body>
                    {parsedTotalCost.cost.toSignificant(4)} ETH ({weiAmountToEURValue(parsedTotalCost.cost)}€)
                  </TYPE.body>
                  <TYPE.subtitle fontSize={12}>
                    Max {parsedTotalCost.maxCost.toSignificant(4)} ETH ({weiAmountToEURValue(parsedTotalCost.maxCost)}€)
                  </TYPE.subtitle>
                </Column>
              </FeeWrapper>
            )}

            {!canPayTransaction && (
              <ErrorCard textAlign="center">
                <Trans>
                  You do not have enough ETH in your Rules wallet to pay for network fees on Starknet.
                  <br />
                  <span onClick={toggleDepositModal}>Buy ETH or deposit from another wallet.</span>
                </Trans>
              </ErrorCard>
            )}

            <SubmitButton type="submit" disabled={!canPayTransaction} large>
              {confirmationActionText ? confirmationActionText : <Trans>Confirm</Trans>}
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
              {confirmationActionText ? confirmationActionText : <Trans>Confirm</Trans>}
            </SubmitButton>
          </Column>
        </StyledForm>
      )}
    </StyledSigner>
  )
}
