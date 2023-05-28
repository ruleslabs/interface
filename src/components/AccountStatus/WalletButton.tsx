import React, { useEffect } from 'react'
import styled from 'styled-components/macro'

import useCurrentUser from 'src/hooks/useCurrentUser'
import { PrimaryButton } from 'src/components/Button'
import { useETHBalance } from 'src/state/wallet/hooks'
import useRulesAccount from 'src/hooks/useRulesAccount'
import { useConnectors } from '@starknet-react/core'

import { ReactComponent as EthereumIcon } from 'src/images/ethereum-plain.svg'
import Box from 'src/theme/components/Box'

const StyledWalletButton = styled(PrimaryButton)<{ $alert: boolean }>`
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

  ${({ theme, $alert }) =>
    !!$alert &&
    theme.before.alert`
      &::before {
        top: -4px;
      }
    `}
`

export default function WalletButton(props: Parameters<typeof PrimaryButton>[0]) {
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
    <StyledWalletButton $alert={!!currentUser?.starknetWallet.lockingReason} {...props}>
      <Box>{address ? `${balance.toFixed(4)}` : 'Loading...'}</Box>
      {!!address && <EthereumIcon />}
    </StyledWalletButton>
  )
}