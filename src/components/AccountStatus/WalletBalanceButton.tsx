import styled from 'styled-components'
import { WeiAmount } from '@rulesorg/sdk-core'

import useCurrentUser from '@/hooks/useCurrentUser'
import { PrimaryButton } from '@/components/Button'
import { TYPE } from '@/styles/theme'
import { useETHBalances } from '@/state/wallet/hooks'
import React from 'react'

import EthereumIcon from '@/images/ethereum-plain.svg'

const WalletButton = styled(PrimaryButton)<{ alert: boolean }>`
  width: unset;
  padding: 0 16px;
  height: 38px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;

  & svg {
    fill: ${({ theme }) => theme.text1};
    height: 18px;
  }

  ${({ theme }) => theme.media.medium`
    padding: 0 12px;
  `}

  ${({ theme, alert }) =>
    !!alert &&
    theme.before.alert`
      ::before {
        top: -4px;
      }
    `}
`

export default function WalletBalanceButton(props: React.HTMLAttributes<HTMLButtonElement>) {
  // current user
  const { currentUser } = useCurrentUser()

  // ETH balance
  const address = currentUser?.starknetWallet.address ?? ''
  const balances = useETHBalances([address])
  const balance = balances?.[address] ?? WeiAmount.fromRawAmount(0)

  return (
    <WalletButton alert={!!currentUser?.starknetWallet.lockingReason} {...props}>
      <TYPE.body fontWeight={500}>{balance ? `${balance.toFixed(4)}` : 'Loading...'}</TYPE.body>
      {!!balance && <EthereumIcon />}
    </WalletButton>
  )
}
