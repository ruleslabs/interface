import React, { useMemo, useCallback } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { useETHBalance } from 'src/state/wallet/hooks'
import Confirmation from './Confirmation'
import { PaginationSpinner } from '../Spinner'
import Error from './Error'
import Column from '../Column'
import { PrimaryButton } from '../Button'
import { RowCenter } from '../Row'
import { TYPE } from 'src/styles/theme'
import { ErrorCard } from '../Card'
import PrivateKeyDecipherForm from './PrivateKeyDecipherForm'
import { useWalletModalToggle } from 'src/state/application/hooks'
import useStarknetTx, { useEstimateFees, useExecuteTx } from 'src/hooks/useStarknetTx'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import useRulesAccount from 'src/hooks/useRulesAccount'
import Pending from './Pending'

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
  children: React.ReactNode
  display: StarknetSignerDisplayProps
}

export default function StarknetSigner({ display, children }: StarknetSignerProps) {
  // modal
  const toggleWalletModal = useWalletModalToggle()

  // wallet lazyness
  const waitingTransactionHash = null

  // handlers
  const [estimateFees, estimateFeesRes] = useEstimateFees()
  const { parsedNetworkFee, parsedTotalCost } = estimateFeesRes.data

  const [executeTx, executeTxRes] = useExecuteTx()
  const { txHash } = executeTxRes.data

  // starknet account
  const { address, account } = useRulesAccount()
  const updateSigner = useCallback(
    (pk: string) => {
      if (!account) return

      account.updateSigner(pk)
      estimateFees()
    },
    [estimateFees, account]
  )

  // starknet state
  const { signing, txValue } = useStarknetTx()

  // can pay
  const balance = useETHBalance(address)
  const canPayTransaction = useMemo(() => {
    if (!parsedTotalCost) return false

    return !balance.lessThan(parsedTotalCost.maxCost)
  }, [balance, parsedTotalCost])

  // loading / error
  const loading = estimateFeesRes.loading || executeTxRes.loading
  const error = estimateFeesRes.error || executeTxRes.error

  // fiat value
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // components
  const modalContent = useMemo(() => {
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

            {!canPayTransaction && (
              <ErrorCard textAlign="center">
                <Trans>
                  You do not have enough ETH in your Rules wallet to pay for network fees on Starknet.
                  <br />
                  <span onClick={toggleWalletModal}>Buy ETH or deposit from another wallet.</span>
                </Trans>
              </ErrorCard>
            )}

            <SubmitButton onClick={() => executeTx(parsedNetworkFee.maxFee)} disabled={!canPayTransaction} large>
              {display.confirmationActionText ?? <Trans>Confirm</Trans>}
            </SubmitButton>
          </Column>
        </StyledForm>
      )
    }

    return <PrivateKeyDecipherForm onPrivateKeyDeciphered={updateSigner} />
  }, [
    waitingTransactionHash,
    loading,
    error,
    txHash,
    executeTx,
    updateSigner,
    txValue,
    parsedTotalCost,
    parsedNetworkFee,
    children,
  ])

  return (
    <>
      <DummyFocusInput type="text" />

      {modalContent}
    </>
  )
}
