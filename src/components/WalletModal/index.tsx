import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Trans, t } from '@lingui/macro'

import ClassicModal, { ModalHeader, ModalContent } from '@/components/Modal/Classic'
import { useModalOpen, useWalletModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'
import { useWalletModalMode, useSetWalletModalMode, useETHBalances } from '@/state/wallet/hooks'
import { WalletModalMode } from '@/state/wallet/actions'
import Column from '@/components/Column'
import Row from '@/components/Row'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import { TYPE } from '@/styles/theme'
import { IconButton, TabButton } from '@/components/Button'
import LockedWallet from '@/components/LockedWallet'
import { ErrorCard } from '@/components/Card'

import Deposit from './Deposit'
import StarkgateDeposit from './StarkgateDeposit'
import Withdraw from './Withdraw'
import StarkgateWithdraw from './StarkgateWithdraw'
import Retrieve from './Retrieve'
import AdvanceWalletSettings from './AdvanceWalletSettings'

import DotsIcon from '@/images/dots.svg'

const AdvancedSettingsButton = styled(IconButton)`
  position: absolute;
  top: 10px;
  left: 10px;
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

const TabBar = styled(Row)`
  justify-content: space-around;
  border-color: ${({ theme }) => theme.bg3}80;
  border-style: solid;
  border-width: 0 0 1px;
  margin: 16px -26px 16px -26px;
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
    <ClassicModal onDismiss={toggleWalletModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleWalletModal} onBack={advancedMode ? toggleAdvancedMode : undefined}>
          {advancedMode && t`Advanced wallet settings`}
        </ModalHeader>

        {advancedMode ? (
          <AdvanceWalletSettings />
        ) : (
          <>
            <AdvancedSettingsButton onClick={toggleAdvancedMode} square>
              <DotsIcon />
            </AdvancedSettingsButton>

            <Column gap={16}>
              <Column gap={8}>
                <ETHBalance>{balance ? `${balance.toFixed(6)} ETH` : '- ETH'}</ETHBalance>
                <FiatBalance>{balance ? `€${weiAmountToEURValue(balance)} EUR` : '- €'}</FiatBalance>
              </Column>

              {currentUser?.starknetWallet.lockingReason && (
                <ErrorCard>
                  <LockedWallet />
                </ErrorCard>
              )}
            </Column>

            <TabBar>
              <TabButton
                onClick={onDepositMode}
                className={
                  walletModalMode === null ||
                  walletModalMode === WalletModalMode.DEPOSIT ||
                  walletModalMode === WalletModalMode.STARKGATE_DEPOSIT
                    ? 'active'
                    : undefined
                }
              >
                <Trans>Deposit</Trans>
              </TabButton>

              <TabButton
                onClick={onWithdrawMode}
                className={
                  walletModalMode === WalletModalMode.WITHDRAW ||
                  walletModalMode === WalletModalMode.STARKGATE_WITHDRAW ||
                  walletModalMode === WalletModalMode.RETRIEVE
                    ? 'active'
                    : undefined
                }
              >
                <Trans>Withdraw</Trans>
              </TabButton>
            </TabBar>

            <ModeContent>{renderModal()}</ModeContent>
          </>
        )}
      </ModalContent>
    </ClassicModal>
  )
}
