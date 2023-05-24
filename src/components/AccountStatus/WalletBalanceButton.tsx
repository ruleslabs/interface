import React, { useEffect } from 'react'
import styled from 'styled-components'

import useCurrentUser from '@/hooks/useCurrentUser'
import { PrimaryButton } from '@/components/Button'
import { TYPE } from '@/styles/theme'
import { useETHBalance } from '@/state/wallet/hooks'
import useRulesAccount from '@/hooks/useRulesAccount'
import { useConnectors } from '@starknet-react/core'

import EthereumIcon from '@/images/ethereum-plain.svg'

const WalletButton = styled(PrimaryButton)<{ alert: boolean }>`
  width: unset;
  padding: 0 16px;
  height: 38px;
  border-radius: 6px;
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

  // auto wallet conect
  const { connect, connectors } = useConnectors()
  useEffect(() => {
    if (currentUser && connectors[0]) {
      connect(connectors[0])
    }
  }, [!!currentUser, !!connectors[0]])

  // ETH balance
  const { address } = useRulesAccount()
  const balance = useETHBalance(address)

  return (
    <WalletButton alert={!!currentUser?.starknetWallet.lockingReason} {...props}>
      <TYPE.body fontWeight={500}>{address ? `${balance.toFixed(4)}` : 'Loading...'}</TYPE.body>
      {!!address && <EthereumIcon />}
    </WalletButton>
  )
}
