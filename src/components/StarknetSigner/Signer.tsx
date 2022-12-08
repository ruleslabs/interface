import JSBI from 'jsbi'
import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { ec, number, Account, Call, EstimateFee, Signature, KeyPair } from 'starknet'
import { WeiAmount } from '@rulesorg/sdk-core'

import { ModalHeader } from '@/components/Modal'
import { useWalletModalToggle } from '@/state/application/hooks'
import { useETHBalances } from '@/state/wallet/hooks'
import Column, { ColumnCenter } from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import { useStarknet } from '@/lib/starknet'
import { useCurrentUser } from '@/state/user/hooks'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import { ErrorCard } from '@/components/Card'
import getNonce from '@/utils/getNonce'
import estimateFee from '@/utils/estimateFee'
import signTransaction from '@/utils/signTransaction'
import PrivateKeyDecipherForm from './PrivateKeyDecipherForm'

const StyledSigner = styled(ColumnCenter)`
  padding-bottom: 8px;
  gap: 32px;
`

const SubmitButton = styled(PrimaryButton)`
  width: 100%;
  height: 55px;
  margin-top: 12px;
`

const StyledForm = styled.form`
  width: 100%;
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
  onDismiss?: () => void
  modalHeaderChildren?: string | React.ReactNode
  onBack?: () => void
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
  onDismiss,
  modalHeaderChildren,
  onBack,
}: SignerProps) {
  // deposit modal
  const toggleWalletModal = useWalletModalToggle()

  // wallet
  const currentUser = useCurrentUser()
  const address = currentUser.starknetWallet.address
  const transactionVersion = currentUser.starknetWallet.transactionVersion

  // starknet account
  const [account, setAccount] = useState<Account | null>(null)
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null)

  // balance
  const balance =
    useETHBalances([currentUser?.starknetWallet.address])[currentUser?.starknetWallet.address] ??
    WeiAmount.fromRawAmount(0)

  // network fee
  const [parsedNetworkFee, setParsedNetworkFee] = useState<{ fee: WeiAmount; maxFee: WeiAmount } | null>(null)
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
    (privateKey: string) => {
      if (!calls) return

      const keyPair = ec.getKeyPair(privateKey)
      if (!keyPair || !provider) {
        onError('Failed to sign transaction')
        return
      }
      const account = new Account(provider, address, keyPair)

      setAccount(account)
      setKeyPair(keyPair)

      onWaitingForFees(true)

      estimateFee(account, keyPair, calls, transactionVersion)
        .then((estimatedFees?: EstimateFee) => {
          const maxFee = estimatedFees?.suggestedMaxFee.toString() ?? '0'
          const fee = estimatedFees?.overall_fee.toString() ?? '0'
          if (maxFee === '0' || fee === '0') {
            onError('Failed to estimate fees')
            return
          }

          onWaitingForFees(false)
          setParsedNetworkFee({ maxFee: WeiAmount.fromRawAmount(maxFee), fee: WeiAmount.fromRawAmount(fee) })
        })
        .catch((error?: Error) => {
          if (!error) return
          console.error(error)

          onError(error.message)
        })
    },
    [address, provider, calls, onError, onWaitingForFees, transactionVersion]
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

          return signTransaction(calls, signerDetails, transactionVersion, { keyPair, signer: account.signer })
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
    <>
      <ModalHeader onDismiss={onDismiss} onBack={onBack}>
        {keyPair ? modalHeaderChildren : t`Enter your password`}
      </ModalHeader>

      <StyledSigner>
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
                      Max {parsedNetworkFee.maxFee.toSignificant(4)} ETH ({weiAmountToEURValue(parsedNetworkFee.maxFee)}
                      €)
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
                      Max {parsedTotalCost.maxCost.toSignificant(4)} ETH ({weiAmountToEURValue(parsedTotalCost.maxCost)}
                      €)
                    </TYPE.subtitle>
                  </Column>
                </FeeWrapper>
              )}

              {!canPayTransaction && (
                <ErrorCard textAlign="center">
                  <Trans>
                    You do not have enough ETH in your Rules wallet to pay for network fees on Starknet.
                    <br />
                    <span onClick={toggleWalletModal}>Buy ETH or deposit from another wallet.</span>
                  </Trans>
                </ErrorCard>
              )}

              <SubmitButton type="submit" disabled={!canPayTransaction} large>
                {confirmationActionText ?? <Trans>Confirm</Trans>}
              </SubmitButton>
            </Column>
          </StyledForm>
        ) : (
          <PrivateKeyDecipherForm onPrivateKeyDeciphered={prepareTransaction} />
        )}
      </StyledSigner>
    </>
  )
}
