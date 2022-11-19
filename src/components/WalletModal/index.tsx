import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Trans, t } from '@lingui/macro'

import Modal, { ModalHeader, ModalContent } from '@/components/Modal'
import { useModalOpen, useWalletModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'
import { useWalletModalMode, useSetWalletModalMode, useETHBalances } from '@/state/wallet/hooks'
import { WalletModalMode } from '@/state/wallet/actions'
import Column from '@/components/Column'
import Row from '@/components/Row'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import { TYPE } from '@/styles/theme'
import { IconButton } from '@/components/Button'

import Deposit from './Deposit'
import StarkgateDeposit from './StarkgateDeposit'
import Withdraw from './Withdraw'
import StarkgateWithdraw from './StarkgateWithdraw'
import Retrieve from './Retrieve'
import AdvanceWalletSettings from './AdvanceWalletSettings'

import Dots from '@/images/dots.svg'

const AdvancedSettingsButton = styled(IconButton)`
  position: absolute;
  top: 10px;
  left: 10px;
  border: solid 1px ${({ theme }) => theme.bg3}80;
  background: transparent;
  border-radius: 3px;

  &:hover {
    background: ${({ theme }) => theme.bg5};
  }
`

const ETHBalance = styled(TYPE.medium)`
  font-size: 32px;
  width: 100%;
  text-align: center;
  margin-top: 16px;
`

const FiatBalance = styled(TYPE.subtitle)`
  width: 100%;
  text-align: center;
  font-size: 16px;
`

const ModeSelectorBar = styled(Row)`
  margin: 16px -26px 16px -26px;
  box-shadow: 0 10px 10px 0px ${({ theme }) => theme.black}40;
`

const ModeSelector = styled(TYPE.medium)<{ selected: boolean }>`
  width: 100%;
  text-align: center;
  padding: 16px 0;
  cursor: pointer;

  ${({ selected, theme }) =>
    selected &&
    `
      border-style: solid;
      border-width: 0 0 2px;
      border-color: ${theme.primary1};
      color: ${theme.primary1};
    `}
`

const ModeContent = styled.div`
  position: relative;
  padding-top: 36px;
`

export default function WalletModal() {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()

  // modal mode
  const walletModalMode = useWalletModalMode()
  const setWalletModalMode = useSetWalletModalMode()

  const onDepositMode = useCallback(() => setWalletModalMode(WalletModalMode.DEPOSIT), [setWalletModalMode])
  const onWithdrawMode = useCallback(() => setWalletModalMode(WalletModalMode.WITHDRAW), [setWalletModalMode])
  const onRetrieveMode = useCallback(() => setWalletModalMode(WalletModalMode.RETRIEVE), [setWalletModalMode])

  // ETH balance
  const weiAmountToEURValue = useWeiAmountToEURValue()
  let balance = useETHBalances([currentUser?.starknetWallet.address])[currentUser?.starknetWallet.address]
  balance = currentUser?.starknetWallet.address ? balance : WeiAmount.fromRawAmount(0)

  // render modal mode
  const renderModal = useCallback(() => {
    switch (walletModalMode) {
      default:
      case WalletModalMode.DEPOSIT:
        return <Deposit />

      case WalletModalMode.STARKGATE_DEPOSIT:
        return <StarkgateDeposit />

      case WalletModalMode.WITHDRAW:
        return <Withdraw />

      case WalletModalMode.STARKGATE_WITHDRAW:
        return <StarkgateWithdraw />

      case WalletModalMode.RETRIEVE:
        return <Retrieve />
    }
    return null
  }, [walletModalMode])

  // advanced
  const [advancedMode, setAdvancedMode] = useState(false)
  const toggleAdvancedMode = useCallback(() => setAdvancedMode(!advancedMode), [advancedMode])

  return (
    <Modal onDismiss={toggleWalletModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleWalletModal} onBack={advancedMode ? toggleAdvancedMode : undefined}>
          {advancedMode && t`Advanced wallet settings`}
        </ModalHeader>

        {advancedMode ? (
          <AdvanceWalletSettings />
        ) : (
          <>
            <AdvancedSettingsButton onClick={toggleAdvancedMode}>
              <Dots />
            </AdvancedSettingsButton>

            <Column gap={8}>
              <ETHBalance>{balance ? `${balance.toFixed(6)} ETH` : '- ETH'}</ETHBalance>
              <FiatBalance>{balance ? `€${weiAmountToEURValue(balance)} EUR` : '- €'}</FiatBalance>
            </Column>

            <ModeSelectorBar>
              <ModeSelector
                selected={
                  walletModalMode === null ||
                  walletModalMode === WalletModalMode.DEPOSIT ||
                  walletModalMode === WalletModalMode.STARKGATE_DEPOSIT
                }
                onClick={onDepositMode}
              >
                <Trans>Deposit</Trans>
              </ModeSelector>

              <ModeSelector
                selected={
                  walletModalMode === WalletModalMode.WITHDRAW ||
                  walletModalMode === WalletModalMode.STARKGATE_WITHDRAW ||
                  walletModalMode === WalletModalMode.RETRIEVE
                }
                onClick={onWithdrawMode}
              >
                <Trans>Withdraw</Trans>
              </ModeSelector>
            </ModeSelectorBar>

            <ModeContent>{renderModal()}</ModeContent>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
