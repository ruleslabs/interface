import React, { useState, useEffect, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'
import { shallow } from 'zustand/shallow'

import { ModalBody } from '@/components/Modal/Classic'
import { useETHBalance, useWaitingTransactionQuery } from '@/state/wallet/hooks'
import Confirmation from './Confirmation'
import { PaginationSpinner } from '../Spinner'
import Error from './Error'
import { useBoundStore } from '@/zustand'
import Column from '../Column'
import { PrimaryButton } from '../Button'
import { RowCenter } from '../Row'
import { TYPE } from '@/styles/theme'
import { ErrorCard } from '../Card'
import PrivateKeyDecipherForm from './PrivateKeyDecipherForm'
import { useWalletModalToggle } from '@/state/application/hooks'
import { useEstimateFees, useExecuteTx } from '@/hooks/useStarknetTx'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import useRulesAccount from '@/hooks/useRulesAccount'

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

const StyledForm = styled.form`
  width: 100%;
`

const FeeWrapper = styled(RowCenter)`
  justify-content: space-between;
  padding: 24px;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}80;
  border-radius: 4px;

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
  children: React.ReactNode
  display: StarknetSignerDisplayProps
}

export default function StarknetSigner({ display, children }: StarknetSignerProps) {
  const [queryError, setQueryError] = useState<string | null>(null)

  // modal
  const toggleWalletModal = useWalletModalToggle()

  // wallet lazyness
  const waitingTransactionQuery = useWaitingTransactionQuery()
  const waitingTransactionHash = waitingTransactionQuery.data?.waitingTransaction?.hash

  useEffect(() => {
    if (waitingTransactionQuery.error) setQueryError('An error has occurred, please refresh the page and try again.')
  }, [waitingTransactionQuery.error])

  // handlers
  const [estimateFees, estimateFeesRes] = useEstimateFees()
  const { parsedNetworkFee, parsedTotalCost } = estimateFeesRes.data

  const [executeTx, executeTxRes] = useExecuteTx()
  const { txHash } = executeTxRes.data

  // starknet account
  const { address, account, needsSignerUpdate } = useRulesAccount()
  const updateSigner = useCallback(
    (pk: string) => {
      if (!account) return

      account.updateSigner(pk)
      estimateFees()
    },
    [estimateFees, account]
  )

  // starknet state
  const { signing, resetStarknetTx, txValue } = useBoundStore(
    (state) => ({ signing: state.signing, resetStarknetTx: state.resetStarknetTx, txValue: state.value }),
    shallow
  )

  // can pay
  const balance = useETHBalance(address)
  const canPayTransaction = useMemo(() => {
    if (!parsedTotalCost) return false

    return !balance.lessThan(parsedTotalCost.maxCost)
  }, [balance, parsedTotalCost])

  // loading / error
  const loading = waitingTransactionQuery.loading || estimateFeesRes.loading
  const error = estimateFeesRes.error || queryError

  // init
  useEffect(() => {
    resetStarknetTx()
  }, [])

  // fiat value
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // components
  const modalContent = useMemo(() => {
    if (txHash) return <Confirmation txHash={txHash} confirmationText={display.confirmationText} />

    if (waitingTransactionHash) {
      return (
        <Confirmation
          txHash={waitingTransactionHash}
          confirmationText={t`Your wallet is already processing another transaction`}
        />
      )
    }

    if (error) return <Error error={error} />

    if (loading) return <PaginationSpinner loading={true} />

    if (parsedNetworkFee) {
      return (
        <StyledForm onSubmit={() => executeTx(parsedNetworkFee.maxFee)}>
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

            {parsedTotalCost && txValue && (
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
              {display.confirmationActionText ?? <Trans>Confirm</Trans>}
            </SubmitButton>
          </Column>
        </StyledForm>
      )
    }

    if (needsSignerUpdate) return <PrivateKeyDecipherForm onPrivateKeyDeciphered={updateSigner} />

    return null
  }, [waitingTransactionHash, loading, error, txHash, needsSignerUpdate])

  return (
    <ModalBody>
      <DummyFocusInput type="text" />

      {signing ? modalContent : children}
    </ModalBody>
  )
}
