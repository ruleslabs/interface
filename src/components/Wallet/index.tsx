import { Trans } from '@lingui/macro'
import React, { useMemo } from 'react'
import { RowCenter } from 'src/components/Row'
import { ReactComponent as RulesPlainIcon } from 'src/images/logo-plain.svg'
import { TYPE } from 'src/styles/theme'
import * as Icons from 'src/theme/components/Icons'
import styled from 'styled-components/macro'

const StyledWallet = styled(RowCenter)`
  padding: 12px;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 6px;
  box-sizing: border-box;
  width: 100%;
  gap: 8px;

  &:focus-within {
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
  layer: 1 | 2 | 'rules'
}

export default function Wallet({ layer, ...props }: WalletProps) {
  const content = useMemo(() => {
    switch (layer) {
      case 1:
        return (
          <>
            <Icons.Ethereum />
            <TYPE.body>
              <Trans>Your Ethereum Wallet</Trans>
            </TYPE.body>
          </>
        )

      case 2:
        return (
          <>
            <Icons.Starknet />
            <TYPE.body>
              <Trans>Your Starknet Wallet</Trans>
            </TYPE.body>
          </>
        )

      case 'rules':
        return (
          <>
            <RulesPlainIcon />
            <TYPE.body>
              <Trans>Your Rules Wallet</Trans>
            </TYPE.body>
          </>
        )
    }
  }, [layer])

  return <StyledWallet {...props}>{content}</StyledWallet>
}
