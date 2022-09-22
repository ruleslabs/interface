import { useCallback, useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { Call, Signature } from 'starknet'

import Modal from '@/components/Modal'
import { useModalOpen, useWithdrawModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import { PrimaryButton, ThirdPartyButton } from '@/components/Button'
import { InfoCard } from '@/components/Card'
import Link from '@/components/Link'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'
import CurrencyInput from '@/components/Input/CurrencyInput'
import { metaMask, metaMaskHooks } from '@/constants/connectors'
import { TYPE } from '@/styles/theme'
import Separator from '@/components/Separator'
import { useCurrentUser } from '@/state/user/hooks'
import StarknetSigner from '@/components/StarknetSigner'
import { useETHBalances, useWithdrawEtherMutation } from '@/state/wallet/hooks'
import { L2_STARKGATE_ADDRESSES, ETH_ADDRESSES } from '@/constants/addresses'
import { networkId } from '@/constants/networks'

import LayerswapIcon from '@/images/layerswap.svg'
import MetamaskIcon from '@/images/metamask.svg'

const { useAccount } = metaMaskHooks

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

export default function WithdrawModal() {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpen(ApplicationModal.WITHDRAW)
  const toggleWithdrawModal = useWithdrawModalToggle()

  // metamask
  const account = useAccount()
  const activateMetamask = useCallback(() => metaMask.activate(), [metaMask])
  const [metamaskFound, setMetamaskFound] = useState(false)

  // attempt to connect eagerly on mount
  useEffect(() => {
    metaMask.connectEagerly()
    if (typeof window.ethereum !== 'undefined') {
      setMetamaskFound(true)
    }
  }, [])

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
        variables: { amount, recipientAddress: account, maxFee, signature: JSON.stringify(signature) },
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

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setWithdrawAmount(null)
      setError(null)
      setTxHash(null)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={toggleWithdrawModal} isOpen={isOpen}>
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

          <Separator>
            <Trans>or</Trans>
          </Separator>

          <TYPE.medium>
            <Trans>To your Ethereum wallet</Trans>
          </TYPE.medium>

          {account ? (
            <Column gap={16}>
              <CurrencyInput
                value={withdrawAmount}
                placeholder="0.0"
                onUserInput={handleWithdrawAmountUpdate}
                balance={balance}
              />
              {!+withdrawAmount || !parsedWithdrawAmount ? (
                <PrimaryButton disabled large>
                  <Trans>Enter an amount</Trans>
                </PrimaryButton>
              ) : balance?.lessThan(parsedWithdrawAmount) ? (
                <PrimaryButton disabled large>
                  <Trans>Insufficient ETH balance</Trans>
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={handleConfirmation} large>
                  <Trans>Next</Trans>
                </PrimaryButton>
              )}
            </Column>
          ) : metamaskFound ? (
            <ThirdPartyButton
              title={t`Connect Metamask`}
              subtitle={t`Withdraw ETH to your wallet`}
              onClick={activateMetamask}
            >
              <MetamaskIcon />
            </ThirdPartyButton>
          ) : (
            <InfoCard textAlign="center">
              <Trans>
                Haven’t got an Ethereum wallet yet?
                <br />
                Learn how to create one with&nbsp;
                <Link href="https://metamask.io/" target="_blank" color="text1" underline>
                  Metamask
                </Link>
              </Trans>
            </InfoCard>
          )}
        </Column>
      </StarknetSigner>
    </Modal>
  )
}
