import React, { useMemo, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { useETHBalance, useIsDeployed, useSetWalletModalMode } from 'src/state/wallet/hooks'
import Confirmation from './Confirmation'
import { PaginationSpinner } from 'src/components/Spinner'
import Error from '../Error'
import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import { RowCenter } from 'src/components/Row'
import { TYPE } from 'src/styles/theme'
import PrivateKeyDecipherForm from '../PrivateKeyDecipherForm'
import { useOpenModal } from 'src/state/application/hooks'
import useStarknetTx, { useEstimateFees, useExecuteTx } from 'src/hooks/useStarknetTx'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import useRulesAccount from 'src/hooks/useRulesAccount'
import Pending from './Pending'
import { WeiAmount } from '@rulesorg/sdk-core'
import { ApplicationModal } from 'src/state/application/actions'
import { WalletModalMode } from 'src/state/wallet/actions'
import DepositNeeded from 'src/components/LockedWallet/DepositNeeded'
import DeploymentNeeded from 'src/components/LockedWallet/DeploymentNeeded'
import { StxAction } from 'src/types/starknetTx'
import useTrans from 'src/hooks/useTrans'
import SignerEscape from 'src/components/LockedWallet/SignerEscape'
import { useMaintenance, useNeedsSignerEscape } from 'src/hooks/useCurrentUser'
import Maintenance from 'src/components/LockedWallet/Maintenance'

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

interface StarknetSignerProps {
  children?: React.ReactNode
  action: StxAction
  skipSignin?: boolean
  allowUndeployed?: boolean
}

export default function StarknetSigner({
  action,
  skipSignin = false,
  allowUndeployed = false,
  children,
}: StarknetSignerProps) {
  const [error, setError] = useState<string | null>(null)

  // i18n
  const trans = useTrans()

  // deposit modal
  const openModal = useOpenModal(ApplicationModal.WALLET)
  const setWalletModalMode = useSetWalletModalMode()

  const openDesitModal = useCallback(() => {
    openModal()
    setWalletModalMode(WalletModalMode.DEPOSIT)
  }, [])

  // current user
  const needsSignerEscape = useNeedsSignerEscape()
  const maintenance = useMaintenance()

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

  useEffect(() => {
    setError(estimateFeesRes.error || executeTxRes.error)
  }, [estimateFeesRes.error, executeTxRes.error])

  // retry
  const retry = estimateFees

  // fiat value
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // components
  const modalContent = useMemo(() => {
    if (maintenance) {
      return <Maintenance />
    }

    if (deployed === undefined) {
      return <PaginationSpinner loading={true} />
    }

    if (deployed === false && !allowUndeployed) {
      return <DeploymentNeeded />
    }

    if (needsSignerEscape && !skipSignin) {
      return <SignerEscape />
    }

    if (!signing) {
      return txHash ? <Pending txHash={txHash} /> : children
    }

    if (txHash) return <Confirmation txHash={txHash} action={action} />

    if (error) return <Error error={error} retry={() => setError(null)} />

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

            <SubmitButton
              onClick={() => executeTx(parsedNetworkFee.maxFee, action)}
              disabled={!canPayTransaction}
              large
            >
              {trans('stxActionConfirm', action)}
            </SubmitButton>
          </Column>
        </StyledForm>
      )
    }

    return <PrivateKeyDecipherForm onPrivateKeyDeciphered={updateSigner} />
  }, [
    action,
    loading,
    error,
    txHash,
    executeTx,
    updateSigner,
    txValue,
    parsedTotalCost,
    parsedNetworkFee,
    children,
    allowUndeployed,
    openDesitModal,
    deployed,
    signing,
    retry,
    skipSignin,
    needsSignerEscape,
    maintenance,
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
