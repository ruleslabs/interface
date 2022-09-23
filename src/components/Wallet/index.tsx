import React from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'

import RulesPlainIcon from '@/images/logo-plain.svg'
import EthereumPlainIcon from '@/images/ethereum-plain.svg'

const StyledWallet = styled(RowCenter)`
  padding: 12px;
  background: ${({ theme }) => theme.bg5};
  border: 1px solid ${({ theme }) => theme.primary1};
  border-radius: 4px;
  box-sizing: border-box;
  width: 100%;
  gap: 8px;

  :focus-within {
    outline: ${({ theme }) => theme.primary1} solid 2px;
    outline-offset: -1px;
  }

  & > div {
    width: 100%;
  }

  svg {
    width: 24px;
    height: 24px;
    fill: ${({ theme }) => theme.text1};
  }
`

interface WalletProps extends React.InputHTMLAttributes<HTMLDivElement> {
  layer: 1 | 2
}

export default function Wallet({ layer, ...props }: WalletProps) {
  return (
    <StyledWallet {...props}>
      {layer === 1 ? (
        <>
          <EthereumPlainIcon />
          <TYPE.body>
            <Trans>Your Ethereum Wallet</Trans>
          </TYPE.body>
        </>
      ) : (
        <>
          <RulesPlainIcon />
          <TYPE.body>
            <Trans>Your Rules Wallet</Trans>
          </TYPE.body>
        </>
      )}
    </StyledWallet>
  )
}