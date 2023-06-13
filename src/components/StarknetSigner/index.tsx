import React, { useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { useETHBalance, useIsDeployed, useSetWalletModalMode } from 'src/state/wallet/hooks'
import Confirmation from './Confirmation'
import { PaginationSpinner } from '../Spinner'
import Error from './Error'
import Column from '../Column'
import { PrimaryButton } from '../Button'
import { RowCenter } from '../Row'
import { TYPE } from 'src/styles/theme'
import PrivateKeyDecipherForm from './PrivateKeyDecipherForm'
import { useOpenModal } from 'src/state/application/hooks'
import useStarknetTx, { useEstimateFees, useExecuteTx } from 'src/hooks/useStarknetTx'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import useRulesAccount from 'src/hooks/useRulesAccount'
import Pending from './Pending'
import { WeiAmount } from '@rulesorg/sdk-core'
import useCurrentUser from 'src/hooks/useCurrentUser'
import LockedWallet from '../LockedWallet'
import { ApplicationModal } from 'src/state/application/actions'
import { WalletModalMode } from 'src/state/wallet/actions'
import DepositNeeded from '../LockedWallet/DepositNeeded'
import DeploymentNeeded from '../LockedWallet/DeploymentNeeded'

const DummyFocusInput = styled.input`
  max-height: 0;
  max-width: 0;
  position: fixed;
  left: 99999px;
`

const SubmitButton = styled(PrimaryButton)`
  width: 100%;
  height: 55px;
  margin-top: 12px;
`

const StyledForm = styled.div`
  width: 100%;
`

const FeeWrapper = styled(RowCenter)`
  justify-content: space-between;
  padding: 24px;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}80;
  border-radius: 6px;

  ${({ theme }) => theme.media.extraSmall`
    padding: 16px;
  `}
`

export interface StarknetSignerDisplayProps {
  confirmationText: string
  confirmationActionText?: string
  transactionText: string
}

interface StarknetSignerProps {
  children?: React.ReactNode
  display: StarknetSignerDisplayProps
  skipSignin?: boolean
  allowUndeployed?: boolean
}

export default function StarknetSigner({
  display,
  skipSignin = false,
  allowUndeployed = false,
  children,
}: StarknetSignerProps) {
  // deposit modal
  const openModal = useOpenModal(ApplicationModal.WALLET)
  const setWalletModalMode = useSetWalletModalMode()

  const openDesitModal = useCallback(() => {
    openModal()
    setWalletModalMode(WalletModalMode.DEPOSIT)
  }, [])

  // current user
  const { currentUser } = useCurrentUser()
  const { lockingReason } = currentUser?.starknetWallet ?? {}

  // handlers
  const [estimateFees, estimateFeesRes] = useEstimateFees()
  const { parsedNetworkFee, parsedTotalCost } = estimateFeesRes.data

  // execution
  const [executeTx, executeTxRes] = useExecuteTx()
  const { txHash } = executeTxRes.data

  // starknet account
  const { address, oldAddress, account } = useRulesAccount()
  const updateSigner = useCallback(
    (pk: string) => {
      if (!account) return

      account.updateSigner(pk)
      estimateFees()
    },
    [estimateFees, account]
  )

  // is deployed
  const deployed = useIsDeployed(address)

  // starknet state
  const { signing, txValue, migration } = useStarknetTx()

  // can pay
  const balance = useETHBalance(migration ? oldAddress : address) ?? WeiAmount.ZERO
  const canPayTransaction = useMemo(() => {
    if (!parsedTotalCost) return false

    return !balance.lessThan(parsedTotalCost.maxCost)
  }, [balance, parsedTotalCost])

  // loading / error
  const loading = estimateFeesRes.loading || executeTxRes.loading || (!parsedNetworkFee && skipSignin)
  const error = estimateFeesRes.error || executeTxRes.error

  // fiat value
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // components
  const modalContent = useMemo(() => {
    if (deployed === undefined) {
      return <PaginationSpinner loading={true} />
    }

    if (deployed === false && !allowUndeployed) {
      return <DeploymentNeeded />
    }

    if (lockingReason) {
      return <LockedWallet />
    }

    if (!signing) {
      return txHash ? <Pending txHash={txHash} /> : children
    }

    if (txHash) return <Confirmation txHash={txHash} confirmationText={display.confirmationText} />

    if (error) return <Error error={error} />

    if (loading) return <PaginationSpinner loading={true} />

    if (parsedNetworkFee) {
      return (
        <StyledForm>
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

            {parsedTotalCost && !txValue.isNull() && (
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

            {!canPayTransaction && <DepositNeeded />}

            <SubmitButton onClick={() => executeTx(parsedNetworkFee.maxFee)} disabled={!canPayTransaction} large>
              {display.confirmationActionText ?? <Trans>Confirm</Trans>}
            </SubmitButton>
          </Column>
        </StyledForm>
      )
    }

    return <PrivateKeyDecipherForm onPrivateKeyDeciphered={updateSigner} />
  }, [
    loading,
    error,
    txHash,
    executeTx,
    updateSigner,
    txValue,
    parsedTotalCost,
    parsedNetworkFee,
    children,
    lockingReason,
    allowUndeployed,
    openDesitModal,
    deployed,
  ])

  useEffect(() => {
    if (skipSignin && signing) {
      estimateFees()
    }
  }, [skipSignin, signing])

  return (
    <>
      <DummyFocusInput type="text" />

      {modalContent}
    </>
  )
}
