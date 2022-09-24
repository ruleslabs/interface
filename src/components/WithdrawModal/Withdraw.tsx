import { useCallback, useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { Call, Signature } from 'starknet'
import { ApolloError } from '@apollo/client'

import { useModalOpen, useWithdrawModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import { RowBetween } from '@/components/Row'
import { PrimaryButton, ThirdPartyButton } from '@/components/Button'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'
import CurrencyInput from '@/components/Input/CurrencyInput'
import { metaMaskHooks } from '@/constants/connectors'
import { TYPE } from '@/styles/theme'
import Separator from '@/components/Separator'
import { useCurrentUser } from '@/state/user/hooks'
import StarknetSigner from '@/components/StarknetSigner'
import { useETHBalances, useWithdrawEtherMutation } from '@/state/wallet/hooks'
import { L2_STARKGATE_ADDRESSES, ETH_ADDRESSES } from '@/constants/addresses'
import { networkId } from '@/constants/networks'
import Wallet from '@/components/Wallet'
import Metamask from '@/components/Metamask'
import { InfoCard } from '@/components/Card'

import Arrow from '@/images/arrow.svg'
import LayerswapIcon from '@/images/layerswap.svg'

const { useAccount, useChainId } = metaMaskHooks

const StyledWithdrawModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

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

interface WithdrawModalProps {
  onRetrieve(): void
}

export default function WithdrawModal({ onRetrieve }: WithdrawModalProps) {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpen(ApplicationModal.WITHDRAW)
  const toggleWithdrawModal = useWithdrawModalToggle()

  // metamask
  const account = useAccount()
  const chainId = useChainId()

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
    (signature: Signature, maxFee: string) => {
      if (!parsedWithdrawAmount || !account) return

      const amount = parsedWithdrawAmount.quotient.toString()

      withdrawEtherMutation({
        variables: { amount, l1Recipient: account, maxFee, signature: JSON.stringify(signature) },
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

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setCalls(null)
      setWithdrawAmount('')
      setError(null)
      setTxHash(null)
    }
  }, [isOpen])

  return (
    <StarknetSigner
      modalHeaderText={t`Withdraw your balance`}
      confirmationText={t`Your ${withdrawAmount} ETH withdraw is on its way`}
      confirmationActionText={t`Confirm withdraw`}
      transactionText={t`${withdrawAmount} ETH withdraw to your Ethereum wallet`}
      transactionValue={parsedWithdrawAmount?.quotient.toString()}
      calls={calls ?? undefined}
      txHash={txHash ?? undefined}
      error={error ?? undefined}
      onDismiss={toggleWithdrawModal}
      onSignature={onSignature}
      onError={onError}
    >
      <Column gap={32}>
        <Column gap={16}>
          <TYPE.medium>
            <Trans>To an exchange (coming soon)</Trans>
          </TYPE.medium>

          <ThirdPartyButton
            title="Layerswap"
            subtitle={t`Move your ETH directly to an exchange (e.g. Binance, Coinbase, Kraken...)`}
            onClick={undefined}
          >
            <LayerswapIcon />
          </ThirdPartyButton>
        </Column>

        <Separator>
          <Trans>or</Trans>
        </Separator>

        <Column gap={16}>
          <RowBetween>
            <TYPE.medium>
              <Trans>To your Ethereum wallet</Trans>
            </TYPE.medium>

            {!!currentUser?.retrievableEthers.length && (
              <TYPE.body color="primary1" fontWeight={500} onClick={onRetrieve} textAlign="right" clickable>
                <Trans>Available ETH ({currentUser.retrievableEthers.length})</Trans>
              </TYPE.body>
            )}
          </RowBetween>

          <Metamask>
            <InfoCard textAlign="center">
              <Trans>
                You will have to sign another transaction once your withdraw will be accepted to completely retrieve
                your funds.
              </Trans>
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
          </Metamask>
        </Column>
      </Column>
    </StarknetSigner>
  )
}
