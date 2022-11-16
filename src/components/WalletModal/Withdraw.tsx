import { useCallback } from 'react'
import { t, Trans } from '@lingui/macro'

import Column from '@/components/Column'
import { ThirdPartyButton } from '@/components/Button'
import { TYPE } from '@/styles/theme'
import Separator from '@/components/Separator'
import { useSetWalletModalMode } from '@/state/wallet/hooks'
import { WalletModalMode } from '@/state/wallet/actions'

import LayerswapIcon from '@/images/layerswap.svg'
import MetamaskIcon from '@/images/metamask.svg'

export default function WithdrawModal() {
  // modal mode
  const setWalletModalMode = useSetWalletModalMode()
  const onRetrieve = useCallback(() => setWalletModalMode(WalletModalMode.RETRIEVE), [])
  const onStarkgateWithdraw = useCallback(() => setWalletModalMode(WalletModalMode.STARKGATE_WITHDRAW), [])

  return (
    <Column gap={32}>
      <Column gap={16}>
        <TYPE.medium>
          <Trans>To an exchange (coming soon)</Trans>
        </TYPE.medium>

        <ThirdPartyButton
          title="Layerswap"
          subtitle={t`Move your ETH directly to an exchange (e.g. Binance, Coinbase, Kraken...)`}
          onClick={undefined}
        >
          <LayerswapIcon />
        </ThirdPartyButton>
      </Column>

      <Separator>
        <Trans>or</Trans>
      </Separator>

      <Column gap={16}>
        <TYPE.medium>
          <Trans>To your Ethereum wallet</Trans>
        </TYPE.medium>

        <ThirdPartyButton
          title={t`Metamask`}
          subtitle={t`Withdraw ETH to your Ethereum wallet`}
          onClick={onStarkgateWithdraw}
        >
          <MetamaskIcon />
        </ThirdPartyButton>
      </Column>
    </Column>
  )
}
