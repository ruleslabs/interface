import { useCallback, useState, useMemo } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { Call, Signature, stark } from 'starknet'
import { ApolloError } from '@apollo/client'

import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'
import CurrencyInput from '@/components/Input/CurrencyInput'
import { metaMaskHooks } from '@/constants/connectors'
import { useCurrentUser } from '@/state/user/hooks'
import StarknetSigner from '@/components/StarknetSigner'
import { useETHBalances, useWithdrawEtherMutation } from '@/state/wallet/hooks'
import { L2_STARKGATE_ADDRESSES, ETH_ADDRESSES } from '@/constants/addresses'
import { networkId } from '@/constants/networks'
import Wallet from '@/components/Wallet'
import Metamask from '@/components/Metamask'
import { InfoCard } from '@/components/Card'

import Arrow from '@/images/arrow.svg'

const { useAccount } = metaMaskHooks

const ArrowWrapper = styled(Column)`
  width: 36px;
  height: 36px;
  background: ${({ theme }) => theme.bg5};
  box-shadow: 0px 0px 5px ${({ theme }) => theme.bg1};
  justify-content: center;
  border-radius: 50%;
  position: relative;
  margin: -6px auto;

  & svg {
    margin: 0 auto;
    width: 22px;
    height: 22px;
    fill: ${({ theme }) => theme.text1};
    transform: rotate(90deg);
  }
`

export default function WithdrawModal() {
  // current user
  const currentUser = useCurrentUser()

  // metamask
  const account = useAccount()

  // balance
  const balance = useETHBalances([currentUser?.starknetWallet.address])[currentUser?.starknetWallet.address]

  // withdraw
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const handleWithdrawAmountUpdate = useCallback((value: string) => setWithdrawAmount(value), [setWithdrawAmount])
  const parsedWithdrawAmount = useMemo(() => tryParseWeiAmount(withdrawAmount), [withdrawAmount])

  // call
  const [calls, setCalls] = useState<Call[] | null>(null)
  const handleConfirmation = useCallback(() => {
    if (!parsedWithdrawAmount || !account) return

    const amount = parsedWithdrawAmount.quotient.toString()

    setCalls([
      {
        contractAddress: ETH_ADDRESSES[networkId],
        entrypoint: 'increaseAllowance',
        calldata: [L2_STARKGATE_ADDRESSES[networkId], amount, 0],
      },
      {
        contractAddress: L2_STARKGATE_ADDRESSES[networkId],
        entrypoint: 'initiate_withdraw',
        calldata: [account, amount, 0],
      },
    ])
  }, [parsedWithdrawAmount, account])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // signature
  const [withdrawEtherMutation] = useWithdrawEtherMutation()
  const [txHash, setTxHash] = useState<string | null>(null)

  const onSignature = useCallback(
    (signature: Signature, maxFee: string, nonce: string) => {
      if (!parsedWithdrawAmount || !account) return

      const amount = parsedWithdrawAmount.quotient.toString()

      withdrawEtherMutation({
        variables: { amount, l1Recipient: account, maxFee, nonce, signature: stark.signatureToDecimalArray(signature) },
      })
        .then((res?: any) => {
          const hash = res?.data?.withdrawEther?.hash
          if (!hash) {
            onError('Transaction not received')
            return
          }

          setTxHash(hash)
        })
        .catch((withdrawEtherError: ApolloError) => {
          const error = withdrawEtherError?.graphQLErrors?.[0]
          onError(error?.message ?? 'Transaction not received')

          console.error(error)
        })
    },
    [parsedWithdrawAmount, account]
  )

  // next step check
  const canWithdraw = useMemo(
    () => +withdrawAmount && parsedWithdrawAmount && balance && !balance.lessThan(parsedWithdrawAmount),
    [withdrawAmount, parsedWithdrawAmount, balance]
  )

  return (
    <StarknetSigner
      confirmationText={t`Your ${withdrawAmount} ETH withdraw is on its way`}
      confirmationActionText={t`Confirm withdraw`}
      transactionText={t`${withdrawAmount} ETH withdraw to your Ethereum wallet`}
      transactionValue={parsedWithdrawAmount?.quotient.toString()}
      calls={calls ?? undefined}
      txHash={txHash ?? undefined}
      error={error ?? undefined}
      onSignature={onSignature}
      onError={onError}
    >
      <Metamask>
        <Column gap={32}>
          <InfoCard textAlign="center">
            <Trans>An additional step will be required to transfer the funds.</Trans>
          </InfoCard>

          <Column>
            <CurrencyInput
              value={withdrawAmount}
              placeholder="0.0"
              onUserInput={handleWithdrawAmountUpdate}
              balance={balance}
            />

            <ArrowWrapper>
              <Arrow />
            </ArrowWrapper>

            <Wallet layer={1} />
          </Column>

          <PrimaryButton onClick={handleConfirmation} disabled={!canWithdraw} large>
            {!+withdrawAmount || !parsedWithdrawAmount ? (
              <Trans>Enter an amount</Trans>
            ) : balance?.lessThan(parsedWithdrawAmount) ? (
              <Trans>Insufficient ETH balance</Trans>
            ) : (
              <Trans>Next</Trans>
            )}
          </PrimaryButton>
        </Column>
      </Metamask>
    </StarknetSigner>
  )
}
