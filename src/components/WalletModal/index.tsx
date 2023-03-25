import { useCallback } from 'react'
import styled from 'styled-components'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Trans, t } from '@lingui/macro'

import { ModalHeader } from '@/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from '@/components/Modal/Classic'
import { useModalOpen, useWalletModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'
import { useWalletModalMode, useSetWalletModalMode, useETHBalances } from '@/state/wallet/hooks'
import { WalletModalMode } from '@/state/wallet/actions'
import Column from '@/components/Column'
import Row, { RowCenter } from '@/components/Row'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import { TYPE } from '@/styles/theme'
import { TabButton } from '@/components/Button'
import LockedWallet from '@/components/LockedWallet'
import { ErrorCard } from '@/components/Card'

import Deposit from './Deposit'
import StarkgateDeposit from './StarkgateDeposit'
import Withdraw from './Withdraw'
import StarkgateWithdraw from './StarkgateWithdraw'
import Retrieve from './Retrieve'

import EthereumIcon from '@/images/ethereum-plain.svg'

const ETHBalance = styled(RowCenter)`
  width: 100%;
  margin-top: 16px;
  gap: 8px;
  justify-content: center;

  & svg {
    fill: ${({ theme }) => theme.text1};
    height: 32px;
  }
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
  margin: 32px -16px;
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
  }, [walletModalMode])

  return (
    <ClassicModal onDismiss={toggleWalletModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleWalletModal} title={t`Wallet`} />

        <ModalBody>
          <Column gap={16}>
            <Column gap={8}>
              <ETHBalance>
                <TYPE.medium fontSize={32}>{balance ? `${balance.toFixed(6)}` : 'Loading ...'}</TYPE.medium>
                <EthereumIcon />
              </ETHBalance>

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

          {renderModal()}
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}
